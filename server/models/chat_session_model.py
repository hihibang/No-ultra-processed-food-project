# models/chat_session_model.py
import json
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

SESSION_LIST_LIMIT = 50


def _load_json_list(value) -> list:
    # aiomysql은 JSON 컬럼을 문자열로 돌려주므로 역직렬화
    if value is None:
        return []
    if isinstance(value, str):
        return json.loads(value)
    return list(value)


class ChatSessionModel:
    @staticmethod
    def _to_session(row) -> dict:
        return {
            "id": row["id"],
            "title": row["title"],
            "messages": _load_json_list(row["messages"]),
            "createdAt": row["created_at"].isoformat(),
            "updatedAt": row["updated_at"].isoformat(),
        }

    @staticmethod
    async def list_by_user(session: AsyncSession, user_id: int) -> List[dict]:
        query = text("""
            SELECT id, title, messages, created_at, updated_at
            FROM chat_sessions
            WHERE user_id = :user_id
            ORDER BY updated_at DESC
            LIMIT :limit
        """)
        result = await session.execute(query, {"user_id": user_id, "limit": SESSION_LIST_LIMIT})
        return [ChatSessionModel._to_session(row) for row in result.mappings().all()]

    @staticmethod
    async def find_owned(session: AsyncSession, user_id: int, session_id: str) -> Optional[dict]:
        query = text("""
            SELECT id, title, messages, created_at, updated_at
            FROM chat_sessions
            WHERE id = :id AND user_id = :user_id
            LIMIT 1
        """)
        result = await session.execute(query, {"id": session_id, "user_id": user_id})
        row = result.mappings().first()
        return ChatSessionModel._to_session(row) if row else None

    @staticmethod
    async def upsert(
        session: AsyncSession,
        user_id: int,
        session_id: str,
        title: str,
        messages: list,
    ) -> Optional[dict]:
        """세션을 생성하거나 갱신한다. 다른 사용자의 세션 ID이면 None을 반환해 존재를 드러내지 않는다."""
        owner_result = await session.execute(
            text("SELECT user_id FROM chat_sessions WHERE id = :id LIMIT 1"),
            {"id": session_id},
        )
        owner_row = owner_result.first()
        if owner_row is not None and owner_row[0] != user_id:
            return None

        params = {
            "id": session_id,
            "user_id": user_id,
            "title": title,
            "messages": json.dumps(messages, ensure_ascii=False),
        }
        if owner_row is None:
            await session.execute(text("""
                INSERT INTO chat_sessions (id, user_id, title, messages)
                VALUES (:id, :user_id, :title, :messages)
            """), params)
        else:
            await session.execute(text("""
                UPDATE chat_sessions
                SET title = :title, messages = :messages
                WHERE id = :id AND user_id = :user_id
            """), params)

        await session.commit()
        return await ChatSessionModel.find_owned(session, user_id, session_id)

    @staticmethod
    async def delete(session: AsyncSession, user_id: int, session_id: str) -> int:
        result = await session.execute(
            text("DELETE FROM chat_sessions WHERE id = :id AND user_id = :user_id"),
            {"id": session_id, "user_id": user_id},
        )
        await session.commit()
        return result.rowcount
