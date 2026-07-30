from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging_config import get_logger
from app.core.security import create_access_token, hash_password, verify_password
from app.services.auth.models import User, UserRole, UserStatus

logger = get_logger("auth")


class AuthError(Exception):
    pass


async def register(db: AsyncSession, email: str, password: str, role: UserRole) -> User:
    if role == UserRole.ADMIN:
        logger.warning("Attempted admin registration blocked: %s", email)
        raise AuthError("Cannot register as admin")

    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        logger.info("Duplicate registration attempt: %s", email)
        raise AuthError("Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
        status=UserStatus.ACTIVE,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    logger.info("User registered: id=%d email=%s role=%s", user.id, email, role.value)
    return user


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        logger.info("Failed login attempt: %s", email)
        raise AuthError("Invalid email or password")

    if user.status != UserStatus.ACTIVE:
        logger.info("Inactive account login blocked: id=%d email=%s", user.id, email)
        raise AuthError("Account is blocked or inactive")

    token = create_access_token(subject=str(user.id))
    logger.info("User logged in: id=%d email=%s role=%s", user.id, email, user.role.value)
    return user, token
