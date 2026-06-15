# Configuration file
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Email settings for password reset (Gmail SMTP)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""       # Gmail App Password (not your login password)
    MAIL_FROM: str = ""
    FRONTEND_URL: str = "https://hotel-pms-red.vercel.app"

    class Config:
        env_file = ".env"

settings = Settings()