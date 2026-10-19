# routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_model import UserModel
from schemas.user_schema import (
    UserSignUpRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    ProfileUpdateRequest,
)
from utils.auth_utils import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: UserSignUpRequest, db: AsyncSession = Depends(get_db)):
    # 1. 이메일 중복 체크
    existing = await UserModel.find_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")

    # 2. 회원가입 INSERT
    try:
        user_id = await UserModel.create_user(db, body)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")

    # 3. 가입 성공 후 즉시 토큰 및 유저 데이터 반환
    user_response = UserResponse(
        user_id=user_id,
        email=body.email,
        name=body.name,
        appliances=body.appliances,
        preferences=body.preferences,
        cooking_level=body.cooking_level,
    )

    return TokenResponse(
        access_token=create_access_token(user_id),
        user=user_response
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    user = await UserModel.find_by_email(db, body.email)

    # 이메일 존재 여부를 드러내지 않도록 실패 메시지는 동일하게 처리
    invalid = HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    if not user or not user["is_active"]:
        raise invalid
    if not UserModel.verify_password(body.password, user["password"]):
        raise invalid

    return TokenResponse(
        access_token=create_access_token(user["user_id"]),
        user=UserResponse(
            user_id=user["user_id"],
            email=user["email"],
            name=user["name"],
            appliances=user["appliances"],
            preferences=user["preferences"],
            cooking_level=user["cooking_level"],
        ),
    )


def _to_user_response(user: dict) -> UserResponse:
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        appliances=user["appliances"],
        preferences=user["preferences"],
        cooking_level=user["cooking_level"],
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _to_user_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    body: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # user_id는 토큰에서만 취득하므로 다른 사용자 정보는 수정할 수 없음
    await UserModel.update_profile(db, current_user["user_id"], body)
    latest = await UserModel.find_by_id(db, current_user["user_id"])
    return _to_user_response(latest)
