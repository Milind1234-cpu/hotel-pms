from fastapi import APIRouter, HTTPException, Depends
from jose import jwt
from datetime import datetime, timedelta, timezone
from models import User
from models import UserRole
from schemas import UserCreate, UserOut, Token, LoginRequest
from config import settings
from dependencies import get_current_user
import bcrypt

router = APIRouter()

# --- Password helpers using bcrypt directly ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


# ─── REGISTER ────────────────────────────────────────────────
@router.post("/register", response_model=Token, status_code=201)
async def register(data: UserCreate):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.staff  # always staff on self-registration
    )
    await user.insert()

    token = create_access_token(str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role
        )
    )


# ─── LOGIN ───────────────────────────────────────────────────
@router.post("/login", response_model=Token)
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role
        )
    )


# ─── GET ME ──────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role
    )