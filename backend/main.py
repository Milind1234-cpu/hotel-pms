from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from config import settings
from models import User, Room, Booking, Invoice
from routers import auth, rooms, bookings, checkin, invoices

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs when server starts
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client["hotel_pms"]          # ← get the database object like this
    await init_beanie(
        database=db,
        document_models=[User, Room, Booking, Invoice]
    )
    print("✅ Connected to MongoDB Atlas!")
    yield
    # Runs when server stops
    client.close()
    print("Disconnected from MongoDB")

app = FastAPI(
    title="Hotel PMS API",
    version="1.0.0",
    lifespan=lifespan
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

@app.get("/")
async def root():
    return {"message": "🏨 Hotel PMS API is running!"}