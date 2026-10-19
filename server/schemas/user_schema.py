# schemas/user_schema.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional


class UserSignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="비밀번호 (8자 이상, UTF-8 72바이트 이하)")
    name: str = Field(..., min_length=1, max_length=100)
    appliances: List[str] = Field(default_factory=list, description="보유 주방기기")
    preferences: List[str] = Field(default_factory=list, description="선호 요리 스타일")
    cooking_level: str = Field("beginner", max_length=50)

    @field_validator("password")
    @classmethod
    def check_password_bytes(cls, v: str) -> str:
        # bcrypt는 입력을 72바이트까지만 사용하므로 초과 시 거부
        if len(v.encode("utf-8")) > 72:
            raise ValueError("비밀번호는 72바이트 이하여야 합니다.")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: int
    email: str
    name: str
    appliances: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    cooking_level: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


COOKING_LEVELS = ("beginner", "intermediate", "advanced")


class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    appliances: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    cooking_level: str = Field(..., max_length=50)

    @field_validator("name")
    @classmethod
    def check_name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("이름을 입력해주세요.")
        return v

    @field_validator("cooking_level")
    @classmethod
    def check_cooking_level(cls, v: str) -> str:
        if v not in COOKING_LEVELS:
            raise ValueError("요리 숙련도 값이 올바르지 않습니다.")
        return v
