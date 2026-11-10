# models/mypage_model.py
import json
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _load_json_object(value) -> dict:
    # aiomysql은 JSON 컬럼을 문자열로 돌려주므로 역직렬화
    if value is None:
        return {}
    if isinstance(value, str):
        return json.loads(value)
    return dict(value)


class MypageLogModel:
    @staticmethod
    def _to_log(row) -> dict:
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "log_type": row["log_type"],
            "title": row["title"],
            "content": _load_json_object(row["content"]),
            "created_at": row["created_at"].isoformat(),
        }

    @staticmethod
    async def list_by_user(session: AsyncSession, user_id: int, log_type: str) -> List[dict]:
        query = text("""
            SELECT id, user_id, log_type, title, content, created_at
            FROM mypage_logs
            WHERE user_id = :user_id AND log_type = :log_type
            ORDER BY created_at DESC, id DESC
        """)
        result = await session.execute(query, {"user_id": user_id, "log_type": log_type})
        return [MypageLogModel._to_log(row) for row in result.mappings().all()]

    @staticmethod
    async def find_owned(session: AsyncSession, user_id: int, log_id: int) -> Optional[dict]:
        query = text("""
            SELECT id, user_id, log_type, title, content, created_at
            FROM mypage_logs
            WHERE id = :id AND user_id = :user_id
            LIMIT 1
        """)
        result = await session.execute(query, {"id": log_id, "user_id": user_id})
        row = result.mappings().first()
        return MypageLogModel._to_log(row) if row else None

    @staticmethod
    async def create(
        session: AsyncSession,
        user_id: int,
        log_type: str,
        title: str,
        content: dict,
    ) -> int:
        query = text("""
            INSERT INTO mypage_logs (user_id, log_type, title, content)
            VALUES (:user_id, :log_type, :title, :content)
        """)
        result = await session.execute(query, {
            "user_id": user_id,
            "log_type": log_type,
            "title": title,
            "content": json.dumps(content, ensure_ascii=False),
        })
        await session.commit()
        return result.lastrowid

    @staticmethod
    async def delete(session: AsyncSession, user_id: int, log_id: int) -> int:
        result = await session.execute(
            text("DELETE FROM mypage_logs WHERE id = :id AND user_id = :user_id"),
            {"id": log_id, "user_id": user_id},
        )
        await session.commit()
        return result.rowcount
