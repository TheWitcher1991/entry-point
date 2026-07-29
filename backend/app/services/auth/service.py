from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.services.auth.models import User, UserRole, UserStatus


class AuthError(Exception):
    pass


async def register(db: AsyncSession, email: str, password: str, role: UserRole) -> User:
    if role == UserRole.ADMIN:
        raise AuthError("Cannot register as admin")

    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
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
    return user


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("Invalid email or password")

    if user.status != UserStatus.ACTIVE:
        raise AuthError("Account is blocked or inactive")

    token = create_access_token(subject=str(user.id))
    return user, token
