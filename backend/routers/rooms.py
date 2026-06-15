from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Room
from schemas import RoomCreate, RoomUpdate, RoomOut
from dependencies import get_current_user, require_admin
from models import User
from beanie import PydanticObjectId

router = APIRouter()


# ─── GET ALL ROOMS ───────────────────────────────────────────
@router.get("/", response_model=List[RoomOut])
async def get_all_rooms(current_user: User = Depends(get_current_user)):
    rooms = await Room.find_all().to_list()
    return [
        RoomOut(
            id=str(r.id),
            room_number=r.room_number,
            room_type=r.room_type,
            price_per_night=r.price_per_night,
            status=r.status,
            description=r.description
        )
        for r in rooms
    ]


# ─── GET AVAILABLE ROOMS ONLY ────────────────────────────────
@router.get("/available/list", response_model=List[RoomOut])
async def get_available_rooms(current_user: User = Depends(get_current_user)):
    rooms = await Room.find(Room.status == "Available").to_list()
    return [
        RoomOut(
            id=str(r.id),
            room_number=r.room_number,
            room_type=r.room_type,
            price_per_night=r.price_per_night,
            status=r.status,
            description=r.description
        )
        for r in rooms
    ]


# ─── GET SINGLE ROOM ─────────────────────────────────────────
@router.get("/{room_id}", response_model=RoomOut)
async def get_room(room_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    room = await Room.get(obj_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomOut(
        id=str(room.id),
        room_number=room.room_number,
        room_type=room.room_type,
        price_per_night=room.price_per_night,
        status=room.status,
        description=room.description
    )


# ─── CREATE ROOM ─────────────────────────────────────────────
@router.post("/", response_model=RoomOut, status_code=201)
async def create_room(data: RoomCreate, current_user: User = Depends(require_admin)):
    # Check if room number already exists
    existing = await Room.find_one(Room.room_number == data.room_number)
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")

    room = Room(
        room_number=data.room_number,
        room_type=data.room_type,
        price_per_night=data.price_per_night,
        status=data.status,
        description=data.description
    )
    await room.insert()

    return RoomOut(
        id=str(room.id),
        room_number=room.room_number,
        room_type=room.room_type,
        price_per_night=room.price_per_night,
        status=room.status,
        description=room.description
    )


# ─── UPDATE ROOM ─────────────────────────────────────────────
@router.put("/{room_id}", response_model=RoomOut)
async def update_room(room_id: str, data: RoomUpdate, current_user: User = Depends(require_admin)):
    try:
        obj_id = PydanticObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    room = await Room.get(obj_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Only update fields that were actually sent
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)

    await room.save()

    return RoomOut(
        id=str(room.id),
        room_number=room.room_number,
        room_type=room.room_type,
        price_per_night=room.price_per_night,
        status=room.status,
        description=room.description
    )


# ─── DELETE ROOM ─────────────────────────────────────────────
@router.delete("/{room_id}")
async def delete_room(room_id: str, current_user: User = Depends(require_admin)):
    from models import Booking
    try:
        obj_id = PydanticObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    room = await Room.get(obj_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Block deletion if there are active bookings for this room
    from beanie.operators import In
    active_bookings = await Booking.find(
        Booking.room_id == room_id,
        In(Booking.status, ["Confirmed", "Checked In"])
    ).to_list()
    if active_bookings:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete room with {len(active_bookings)} active booking(s). Cancel or check out guests first."
        )

    await room.delete()
    return {"message": f"Room {room.room_number} deleted successfully"}