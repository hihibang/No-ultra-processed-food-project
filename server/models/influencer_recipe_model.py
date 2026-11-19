# models/influencer_recipe_model.py
# 인플루언서 검수 레시피 조회. 검수 완료(is_verified = 1)된 행만 다룬다.
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class InfluencerRecipeModel:
    @staticmethod
    async def list_verified(session: AsyncSession, creator_id: Optional[str] = None) -> List[dict]:
        where = "is_verified = 1" + (" AND creator_id = :creator_id" if creator_id else "")
        result = await session.execute(text(f"""
            SELECT recipe_id, creator_id, creator_name, recipe_title, created_at
            FROM influencer_recipes
            WHERE {where}
            ORDER BY created_at DESC, recipe_id DESC
        """), {"creator_id": creator_id} if creator_id else {})
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    async def list_creators(session: AsyncSession) -> List[dict]:
        # 검수 레시피를 하나 이상 가진 크리에이터 목록 (이름은 가장 최근 표기를 쓴다)
        result = await session.execute(text("""
            SELECT r.creator_id, r.creator_name, c.recipe_count
            FROM (
                SELECT creator_id, MAX(recipe_id) AS latest_id, COUNT(*) AS recipe_count
                FROM influencer_recipes WHERE is_verified = 1 GROUP BY creator_id
            ) c
            JOIN influencer_recipes r ON r.recipe_id = c.latest_id
            ORDER BY r.creator_name
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
