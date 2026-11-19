# models/interaction_model.py
# 추천용 행동 로그 접근 계층. 찜/비교/레시피 보관 로그도 함께 읽어 CF 입력으로 쓴다.
import json
from typing import List

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _load_json_list(value) -> list:
    if value is None:
        return []
    if isinstance(value, str):
        return json.loads(value)
    return list(value)


def _load_json_object(value) -> dict:
    if value is None:
        return {}
    if isinstance(value, str):
        return json.loads(value)
    return dict(value)


class InteractionModel:
    @staticmethod
    async def insert(
        session: AsyncSession,
        user_id: int,
        item_type: str,
        item_id: str,
        action: str,
        weight: float,
        label: str | None,
    ) -> int:
        result = await session.execute(
            text("""
                INSERT INTO user_interactions (user_id, item_type, item_id, action, weight, label)
                VALUES (:user_id, :item_type, :item_id, :action, :weight, :label)
            """),
            {
                "user_id": user_id,
                "item_type": item_type,
                "item_id": item_id,
                "action": action,
                "weight": weight,
                "label": label,
            },
        )
        await session.commit()
        return result.lastrowid

    @staticmethod
    async def list_interactions(session: AsyncSession) -> List[dict]:
        result = await session.execute(text("""
            SELECT user_id, item_type, item_id, action, label, created_at
            FROM user_interactions
        """))
        return [dict(row) for row in result.mappings().all()]

    @staticmethod
    async def list_wishlists(session: AsyncSession) -> List[dict]:
        result = await session.execute(text("SELECT user_id, food_id, created_at FROM wishlists"))
        return [dict(row) for row in result.mappings().all()]

    @staticmethod
    async def list_comparisons(session: AsyncSession) -> List[dict]:
        result = await session.execute(text("SELECT user_id, product_ids, created_at FROM comparison_logs"))
        return [
            {"user_id": row["user_id"], "product_ids": _load_json_list(row["product_ids"]), "created_at": row["created_at"]}
            for row in result.mappings().all()
        ]

    @staticmethod
    async def list_recipe_logs(session: AsyncSession) -> List[dict]:
        # 마이페이지 레시피 보관함(mypage_logs, log_type = 'recipe')
        result = await session.execute(text("""
            SELECT user_id, title, content, created_at
            FROM mypage_logs
            WHERE log_type = 'recipe'
        """))
        return [
            {
                "user_id": row["user_id"],
                "title": row["title"],
                "markdown": _load_json_object(row["content"]).get("markdown"),
                "created_at": row["created_at"],
            }
            for row in result.mappings().all()
        ]

    @staticmethod
    async def list_profiles(session: AsyncSession) -> List[dict]:
        result = await session.execute(text("""
            SELECT user_id, appliances, preferences
            FROM users
            WHERE is_active = 1
        """))
        return [
            {
                "user_id": row["user_id"],
                "appliances": _load_json_list(row["appliances"]),
                "preferences": _load_json_list(row["preferences"]),
            }
            for row in result.mappings().all()
        ]
