# models/user_model.py
import json
import bcrypt
from typing import Optional
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user_schema import UserSignUpRequest, ProfileUpdateRequest


class UserModel:
    @staticmethod
    def hash_password(plain: str) -> str:
        return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
        except ValueError:
            # 해시 형식이 올바르지 않은 경우 검증 실패로 처리
            return False

    @staticmethod
    def _load_json_list(value) -> list:
        # aiomysql은 JSON 컬럼을 문자열로 돌려주므로 역직렬화
        if value is None:
            return []
        if isinstance(value, str):
            return json.loads(value)
        return list(value)

    @staticmethod
    def _format_row(row) -> dict:
        return {
            "user_id": row["user_id"],
            "email": row["email"],
            "password": row["password"],
            "name": row["name"],
            "appliances": UserModel._load_json_list(row["appliances"]),
            "preferences": UserModel._load_json_list(row["preferences"]),
            "cooking_level": row["cooking_level"],
            "is_active": bool(row["is_active"]),
        }

    @staticmethod
    async def find_by_email(session: AsyncSession, email: str) -> Optional[dict]:
        query = text("""
            SELECT user_id, email, password, name, appliances, preferences, cooking_level, is_active
            FROM users
            WHERE email = :email
            LIMIT 1
        """)
        result = await session.execute(query, {"email": email})
        row = result.mappings().first()
        return UserModel._format_row(row) if row else None

    @staticmethod
    async def create_user(session: AsyncSession, data: UserSignUpRequest) -> int:
        query = text("""
            INSERT INTO users (email, password, name, appliances, preferences, cooking_level)
            VALUES (:email, :password, :name, :appliances, :preferences, :cooking_level)
        """)
        result = await session.execute(query, {
            "email": data.email,
            "password": UserModel.hash_password(data.password),
            "name": data.name,
            "appliances": json.dumps(data.appliances, ensure_ascii=False),
            "preferences": json.dumps(data.preferences, ensure_ascii=False),
            "cooking_level": data.cooking_level,
        })
        await session.commit()
        return result.lastrowid

    @staticmethod
    async def find_by_id(session: AsyncSession, user_id: int) -> Optional[dict]:
        query = text("""
            SELECT user_id, email, password, name, appliances, preferences, cooking_level, is_active
            FROM users
            WHERE user_id = :user_id
            LIMIT 1
        """)
        result = await session.execute(query, {"user_id": user_id})
        row = result.mappings().first()
        return UserModel._format_row(row) if row else None

    @staticmethod
    async def update_profile(session: AsyncSession, user_id: int, data: ProfileUpdateRequest) -> None:
        query = text("""
            UPDATE users
            SET name = :name,
                appliances = :appliances,
                preferences = :preferences,
                cooking_level = :cooking_level,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = :user_id
        """)
        await session.execute(query, {
            "user_id": user_id,
            "name": data.name,
            "appliances": json.dumps(data.appliances, ensure_ascii=False),
            "preferences": json.dumps(data.preferences, ensure_ascii=False),
            "cooking_level": data.cooking_level,
        })
        await session.commit()
