# Database models
from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional
from datetime import date, datetime, timezone
from enum import Enum

# --- These are like dropdown options ---

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

# --- These are your database collections (like tables) ---

class User(Document):
    name: str
    email: EmailStr
    hashed_password: str
    role: UserRole = UserRole.staff
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"  # collection name in MongoDB

class Room(Document):
    room_number: str
    room_type: RoomType
    price_per_night: float
    status: RoomStatus = RoomStatus.available
    description: Optional[str] = None

    class Settings:
        name = "rooms"

class Booking(Document):
    guest_name: str
    guest_email: EmailStr
    guest_phone: Optional[str] = None
    num_guests: int = 1
    room_id: str
    check_in_date: date
    check_out_date: date
    status: BookingStatus = BookingStatus.confirmed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "bookings"

class Invoice(Document):
    booking_id: str
    guest_name: str
    guest_email: str = ""
    guest_phone: Optional[str] = None
    num_guests: int = 1
    room_number: str
    room_type: str
    check_in_date: date
    check_out_date: date
    total_nights: int
    price_per_night: float
    room_charges: float
    tax: float
    total_amount: float
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invoices"
