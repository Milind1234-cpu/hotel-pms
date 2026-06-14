from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    staff = "staff"

class RoomType(str, Enum):
    standard = "Standard"
    deluxe = "Deluxe"
    suite = "Suite"

class RoomStatus(str, Enum):
    available = "Available"
    occupied = "Occupied"
    maintenance = "Maintenance"

class BookingStatus(str, Enum):
    confirmed = "Confirmed"
    checked_in = "Checked In"
    checked_out = "Checked Out"
    cancelled = "Cancelled"

# --- Auth schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.staff

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Room schemas ---
class RoomCreate(BaseModel):
    room_number: str
    room_type: RoomType
    price_per_night: float
    status: RoomStatus = RoomStatus.available
    description: Optional[str] = None

class RoomUpdate(BaseModel):
    room_type: Optional[RoomType] = None
    price_per_night: Optional[float] = None
    status: Optional[RoomStatus] = None
    description: Optional[str] = None

class RoomOut(BaseModel):
    id: str
    room_number: str
    room_type: RoomType
    price_per_night: float
    status: RoomStatus
    description: Optional[str] = None

# --- Booking schemas ---
class BookingCreate(BaseModel):
    guest_name: str
    guest_email: EmailStr
    guest_phone: Optional[str] = None
    num_guests: int = 1
    room_id: str
    check_in_date: date
    check_out_date: date

class BookingOut(BaseModel):
    id: str
    guest_name: str
    guest_email: str
    guest_phone: Optional[str]
    num_guests: int
    room_id: str
    check_in_date: date
    check_out_date: date
    status: BookingStatus
    created_at: datetime

# --- Invoice schemas ---
class InvoiceOut(BaseModel):
    id: str
    booking_id: str
    guest_name: str
    room_number: str
    room_type: str
    check_in_date: date
    check_out_date: date
    total_nights: int
    price_per_night: float
    room_charges: float
    tax: float
    total_amount: float
    issued_at: datetime# Pydantic schemas
