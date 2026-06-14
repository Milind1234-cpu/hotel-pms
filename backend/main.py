from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from models import User, Room, Booking, Invoice
from routers import auth, rooms, bookings, checkin, invoices

app = FastAPI(
    title="Hotel PMS API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(rooms.router,    prefix="/rooms",    tags=["Rooms"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(checkin.router,  prefix="/checkin",  tags=["Check-In/Out"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])

# Initialize DB on startup — works for both uvicorn and Vercel serverless
_db_initialized = False

@app.middleware("http")
async def ensure_db(request, call_next):
    global _db_initialized
    if not _db_initialized:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client["hotel_pms"]
        await init_beanie(
            database=db,
            document_models=[User, Room, Booking, Invoice]
        )
        _db_initialized = True
    return await call_next(request)

@app.get("/")
async def root():
    return {"message": "🏨 Hotel PMS API is running!"}
