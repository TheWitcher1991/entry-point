from datetime import UTC, datetime, timedelta

import bcrypt as _bcrypt
from jose import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return jwt.encode(  # type: ignore[no-any-return]
        {"sub": subject, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
