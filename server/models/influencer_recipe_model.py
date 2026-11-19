# models/influencer_recipe_model.py
# 인플루언서 검수 레시피 조회. 검수 완료(is_verified = 1)된 행만 다룬다.
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class InfluencerRecipeModel:
    @staticmethod
    async def list_verified(session: AsyncSession) -> List[dict]:
        result = await session.execute(text("""
            SELECT recipe_id, creator_id, creator_name, recipe_title, created_at
            FROM influencer_recipes
            WHERE is_verified = 1
            ORDER BY created_at DESC, recipe_id DESC
        """))
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    async def find_verified(session: AsyncSession, recipe_id: int) -> Optional[dict]:
        result = await session.execute(text("""
            SELECT recipe_id, creator_id, creator_name, recipe_title, recipe_markdown
            FROM influencer_recipes
            WHERE recipe_id = :recipe_id AND is_verified = 1
        """), {"recipe_id": recipe_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None
