from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Invoice
from schemas import InvoiceOut
from dependencies import get_current_user
from models import User
from beanie import PydanticObjectId

router = APIRouter()


def _to_out(i: Invoice) -> InvoiceOut:
    return InvoiceOut(
        id=str(i.id),
        booking_id=str(i.booking_id),
        guest_name=i.guest_name,
        guest_email=getattr(i, 'guest_email', ''),
        guest_phone=getattr(i, 'guest_phone', None),
        num_guests=getattr(i, 'num_guests', 1),
        room_number=i.room_number,
        room_type=i.room_type,
        check_in_date=i.check_in_date,
        check_out_date=i.check_out_date,
        total_nights=i.total_nights,
        price_per_night=i.price_per_night,
        room_charges=i.room_charges,
        tax=i.tax,
        total_amount=i.total_amount,
        issued_at=i.issued_at
    )


# ─── GET ALL INVOICES ─────────────────────────────────────────
@router.get("/all", response_model=List[InvoiceOut])
async def get_all_invoices(current_user: User = Depends(get_current_user)):
    invoices = await Invoice.find_all().to_list()
    return [_to_out(i) for i in invoices]


# ─── GET INVOICE BY BOOKING ID ────────────────────────────────
@router.get("/booking/{booking_id}", response_model=InvoiceOut)
async def get_invoice_by_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    invoice = await Invoice.find_one(Invoice.booking_id == booking_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found for this booking")
    return _to_out(invoice)


# ─── GET SINGLE INVOICE ───────────────────────────────────────
@router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    try:
        obj_id = PydanticObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid invoice ID")

    invoice = await Invoice.get(obj_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _to_out(invoice)
