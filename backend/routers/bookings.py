from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date
from models import Booking, Room
from schemas import BookingCreate, BookingOut
from dependencies import get_current_user
from models import User
from beanie import PydanticObjectId

router = APIRouter()


# ─── HELPER: Check for double booking ────────────────────────
async def is_room_available(room_id: str, check_in: date, check_out: date, exclude_booking_id: str = None) -> bool:
    bookings = await Booking.find(
        Booking.room_id == room_id,
        Booking.status != "Cancelled",
        Booking.status != "Checked Out"
    ).to_list()

    for b in bookings:
        # Skip the current booking if updating
        if exclude_booking_id and str(b.id) == exclude_booking_id:
            continue
        # Check if dates overlap
        if not (check_out <= b.check_in_date or check_in >= b.check_out_date):
            return False  # Room is NOT available
    return True  # Room IS available


# ─── GET ALL BOOKINGS ─────────────────────────────────────────
@router.get("/", response_model=List[BookingOut])
async def get_all_bookings(current_user: User = Depends(get_current_user)):
    bookings = await Booking.find_all().to_list()
    return [
        BookingOut(
            id=str(b.id),
            guest_name=b.guest_name,
            guest_email=b.guest_email,
            guest_phone=b.guest_phone,
            num_guests=b.num_guests,
            room_id=b.room_id,
            check_in_date=b.check_in_date,
            check_out_date=b.check_out_date,
            status=b.status,
            created_at=b.created_at
        )
        for b in bookings
    ]


# ─── GET BOOKINGS BY ROOM ─────────────────────────────────────
@router.get("/room/{room_id}", response_model=List[BookingOut])
async def get_bookings_by_room(room_id: str, current_user: User = Depends(get_current_user)):
    bookings = await Booking.find(Booking.room_id == room_id).to_list()
    return [
        BookingOut(
            id=str(b.id),
            guest_name=b.guest_name,
            guest_email=b.guest_email,
            guest_phone=b.guest_phone,
            num_guests=b.num_guests,
            room_id=b.room_id,
            check_in_date=b.check_in_date,
            check_out_date=b.check_out_date,
            status=b.status,
            created_at=b.created_at
        )
        for b in bookings
    ]


# ─── GET SINGLE BOOKING ───────────────────────────────────────
@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await Booking.get(obj_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingOut(
        id=str(booking.id),
        guest_name=booking.guest_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        num_guests=booking.num_guests,
        room_id=booking.room_id,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        status=booking.status,
        created_at=booking.created_at
    )


# ─── CREATE BOOKING ───────────────────────────────────────────
@router.post("/", response_model=BookingOut, status_code=201)
async def create_booking(data: BookingCreate, current_user: User = Depends(get_current_user)):
    # Validate dates
    if data.check_in_date >= data.check_out_date:
        raise HTTPException(
            status_code=400,
            detail="Check-out date must be after check-in date"
        )

    if data.check_in_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in date cannot be in the past"
        )

    # Check room exists
    try:
        room_obj_id = PydanticObjectId(data.room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    room = await Room.get(room_obj_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check room is not under maintenance
    if room.status == "Maintenance":
        raise HTTPException(
            status_code=400,
            detail="Room is under maintenance and cannot be booked"
        )

    # Check for double booking
    available = await is_room_available(data.room_id, data.check_in_date, data.check_out_date)
    if not available:
        raise HTTPException(
            status_code=400,
            detail="Room is already booked for the selected dates"
        )

    # Create the booking
    booking = Booking(
        guest_name=data.guest_name,
        guest_email=data.guest_email,
        guest_phone=data.guest_phone,
        num_guests=data.num_guests,
        room_id=data.room_id,
        check_in_date=data.check_in_date,
        check_out_date=data.check_out_date,
    )
    await booking.insert()

    # Do NOT change room status here — it becomes Occupied at check-in time
    # The double-booking check above already prevents conflicting reservations

    return BookingOut(
        id=str(booking.id),
        guest_name=booking.guest_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        num_guests=booking.num_guests,
        room_id=booking.room_id,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        status=booking.status,
        created_at=booking.created_at
    )


# ─── CANCEL BOOKING ───────────────────────────────────────────
@router.put("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await Booking.get(obj_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in ["Checked Out", "Cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a booking that is already {booking.status}"
        )

    # Cancel the booking
    booking.status = "Cancelled"
    await booking.save()

    # Only set room back to Available if no other active bookings exist for it
    try:
        room_obj_id = PydanticObjectId(booking.room_id)
    except Exception:
        room_obj_id = None
    room = await Room.get(room_obj_id) if room_obj_id else None
    if room and room.status != "Maintenance":
        other_active = await Booking.find(
            Booking.room_id == booking.room_id,
            Booking.status == "Checked In"
        ).to_list()
        if not other_active:
            room.status = "Available"
            await room.save()

    return BookingOut(
        id=str(booking.id),
        guest_name=booking.guest_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        num_guests=booking.num_guests,
        room_id=booking.room_id,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        status=booking.status,
        created_at=booking.created_at
    )