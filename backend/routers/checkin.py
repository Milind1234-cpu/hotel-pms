from fastapi import APIRouter, HTTPException, Depends
from models import Booking, Room, Invoice
from schemas import BookingOut, InvoiceOut
from dependencies import get_current_user
from models import User
from beanie import PydanticObjectId
from datetime import date

router = APIRouter()


# ─── CHECK IN ────────────────────────────────────────────────
@router.post("/checkin/{booking_id}", response_model=BookingOut)
async def check_in(booking_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await Booking.get(obj_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "Confirmed":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot check in. Booking status is '{booking.status}'"
        )

    if date.today() < booking.check_in_date:
        raise HTTPException(
            status_code=400,
            detail=f"Too early to check in. Check-in date is {booking.check_in_date}"
        )

    booking.status = "Checked In"
    await booking.save()

    room = await Room.get(PydanticObjectId(booking.room_id))
    if room:
        room.status = "Occupied"
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


# ─── CHECK OUT ───────────────────────────────────────────────
@router.post("/checkout/{booking_id}", response_model=InvoiceOut)
async def check_out(booking_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await Booking.get(obj_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != "Checked In":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot check out. Booking status is '{booking.status}'"
        )

    room = await Room.get(PydanticObjectId(booking.room_id))
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Calculate bill
    total_nights = (booking.check_out_date - booking.check_in_date).days
    if total_nights <= 0:
        total_nights = 1
    room_charges = total_nights * room.price_per_night
    tax = round(room_charges * 0.18, 2)
    total_amount = round(room_charges + tax, 2)

    # Update statuses
    booking.status = "Checked Out"
    await booking.save()

    room.status = "Available"
    await room.save()

    # Create invoice
    invoice = Invoice(
        booking_id=str(booking.id),
        guest_name=booking.guest_name,
        room_number=room.room_number,
        room_type=room.room_type.value,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        total_nights=total_nights,
        price_per_night=room.price_per_night,
        room_charges=room_charges,
        tax=tax,
        total_amount=total_amount
    )
    await invoice.insert()

    return InvoiceOut(
        id=str(invoice.id),
        booking_id=str(invoice.booking_id),
        guest_name=invoice.guest_name,
        room_number=invoice.room_number,
        room_type=invoice.room_type,
        check_in_date=invoice.check_in_date,
        check_out_date=invoice.check_out_date,
        total_nights=invoice.total_nights,
        price_per_night=invoice.price_per_night,
        room_charges=invoice.room_charges,
        tax=invoice.tax,
        total_amount=invoice.total_amount,
        issued_at=invoice.issued_at
    )