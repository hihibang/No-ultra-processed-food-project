# utils/auth_utils.py
import os
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_model import UserModel

JWT_ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="인증 정보가 올바르지 않습니다. 다시 로그인해 주세요.",
)


def _get_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY 환경변수가 설정되지 않았습니다. server/.env를 확인하세요.")
    return secret


def create_access_token(user_id: int) -> str:
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, _get_secret(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> int:
    # 만료/위조/형식 오류는 모두 PyJWT 예외로 올라오므로 401로 변환
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise CREDENTIALS_ERROR


async def resolve_current_user(credentials: HTTPAuthorizationCredentials | None, db: AsyncSession) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise CREDENTIALS_ERROR

    user_id = decode_access_token(credentials.credentials)
    user = await UserModel.find_by_id(db, user_id)
    if not user or not user["is_active"]:
        raise CREDENTIALS_ERROR
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await resolve_current_user(credentials, db)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict | None:
    # 토큰이 없으면 비로그인(None), 토큰이 있으면 유효성을 검증한다 (잘못된 토큰은 401)
    if credentials is None:
        return None
    return await resolve_current_user(credentials, db)
