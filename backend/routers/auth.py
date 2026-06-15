from fastapi import APIRouter, HTTPException, Depends
from jose import jwt
from datetime import datetime, timedelta, timezone
from models import User
from models import UserRole
from schemas import UserCreate, UserOut, Token, LoginRequest
from config import settings
from dependencies import get_current_user
import bcrypt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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


# ─── HELPERS ─────────────────────────────────────────────────
def create_reset_token(user_id: str) -> str:
    """Short-lived 30-minute token for password reset."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload = {"sub": user_id, "exp": expire, "type": "reset"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def send_reset_email(to_email: str, reset_url: str, user_name: str) -> bool:
    """Send password reset email via Gmail SMTP. Returns False if email not configured."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        return False  # Email not configured — caller handles fallback

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Hotel PMS — Reset Your Password"
    msg["From"] = settings.MAIL_FROM or settings.MAIL_USERNAME
    msg["To"] = to_email

    html = f"""
    <html><body style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
        <h2 style="color: #0F5EF7; margin-top: 0;">Hotel PMS</h2>
        <p style="color: #333;">Hi <strong>{user_name}</strong>,</p>
        <p style="color: #555;">You requested a password reset. Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}" style="background: #0F5EF7; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 13px;">If you did not request this, ignore this email. Your password will not change.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #bbb; font-size: 12px; text-align: center;">Hotel PMS &bull; Excellence Suite</p>
      </div>
    </body></html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_USERNAME, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False


# ─── FORGOT PASSWORD ─────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = await User.find_one(User.email == email)

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    reset_token = create_reset_token(str(user.id))
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    email_sent = send_reset_email(user.email, reset_url, user.name)

    if not email_sent:
        # Email not configured — return the token directly for dev/demo use
        # In production with email configured this branch won't be reached
        return {
            "message": "Email service not configured. Use the token below directly.",
            "reset_url": reset_url,
            "dev_note": "Set MAIL_USERNAME and MAIL_PASSWORD in environment variables to enable email sending."
        }

    return {"message": "If that email exists, a reset link has been sent."}


# ─── RESET PASSWORD ──────────────────────────────────────────
@router.post("/reset-password")
async def reset_password(data: dict):
    token = data.get("token", "")
    new_password = data.get("new_password", "")

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid reset token")
    except Exception:
        raise HTTPException(status_code=400, detail="Reset token is invalid or has expired")

    from beanie import PydanticObjectId
    try:
        obj_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user = await User.get(obj_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(new_password)
    await user.save()

    return {"message": "Password reset successfully. You can now log in."}
