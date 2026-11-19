# models/influencer_follow_model.py
# 인플루언서 찜(팔로우) 저장. 찜하면 행동 로그(user_interactions, action=wish)도 함께 남긴다.
from typing import Set

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class InfluencerFollowModel:
    @staticmethod
    async def list_followed(session: AsyncSession, user_id: int) -> Set[str]:
        result = await session.execute(
            text("SELECT creator_id FROM influencer_follows WHERE user_id = :u"), {"u": user_id},
        )
        return {row[0] for row in result.fetchall()}

    @staticmethod
    async def follow(session: AsyncSession, user_id: int, creator_id: str, creator_name: str) -> None:
        await session.execute(
            text("INSERT IGNORE INTO influencer_follows (user_id, creator_id) VALUES (:u, :c)"),
            {"u": user_id, "c": creator_id},
        )
        await session.execute(text("""
            INSERT INTO user_interactions (user_id, item_type, item_id, action, weight, label)
            VALUES (:u, 'influencer', :c, 'wish', 5, :label)
        """), {"u": user_id, "c": creator_id, "label": creator_name[:255]})
        await session.commit()

    @staticmethod
    async def unfollow(session: AsyncSession, user_id: int, creator_id: str) -> None:
        # 찜 해제: 찜 상태와 찜 행동 로그를 함께 지워 협업 필터링에도 더 이상 남지 않게 한다
        await session.execute(
            text("DELETE FROM influencer_follows WHERE user_id = :u AND creator_id = :c"),
            {"u": user_id, "c": creator_id},
        )
        await session.execute(text("""
            DELETE FROM user_interactions
            WHERE user_id = :u AND item_type = 'influencer' AND item_id = :c AND action = 'wish'
        """), {"u": user_id, "c": creator_id})
        await session.commit()
