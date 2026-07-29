from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth.service import AuthError, login, register

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_endpoint(
    body: RegisterRequest, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    try:
        await register(db, body.email, body.password, body.role)
        _, token = await login(db, body.email, body.password)
        return TokenResponse(access_token=token)
    except AuthError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login_endpoint(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        _, token = await login(db, body.email, body.password)
        return TokenResponse(access_token=token)
    except AuthError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
