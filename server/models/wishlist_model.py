# models/wishlist_model.py
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _to_food_details(row) -> Optional[dict]:
    # 상품이 active_food_catalog에서 빠진 경우 상세 정보는 None
    if row["report_no"] is None:
        return None
    return {
        "reportNo": row["report_no"],
        "productName": row["product_name"],
        "companyName": row["company_name"],
        "foodCategory": row["product_type"],
        "calories": float(row["calories"] or 0.0),
        "imageUrl": row["image_url"],
    }


class WishlistModel:
    @staticmethod
    async def get_user_wishlist(session: AsyncSession, user_id: int) -> List[dict]:
        query = text("""
            SELECT
                w.wishlist_id,
                w.user_id,
                w.food_id,
                f.report_no,
                f.product_name,
                f.company_name,
                f.product_type,
                f.calories,
                f.image_url
            FROM wishlists w
            LEFT JOIN active_food_catalog f ON f.report_no = w.food_id
            WHERE w.user_id = :user_id
            ORDER BY w.created_at DESC, w.wishlist_id DESC
        """)
        result = await session.execute(query, {"user_id": user_id})
        return [
            {
                "wishlist_id": row["wishlist_id"],
                "user_id": row["user_id"],
                "food_id": row["food_id"],
                "food_details": _to_food_details(row),
            }
            for row in result.mappings().all()
        ]

    @staticmethod
    async def food_exists(session: AsyncSession, food_id: str) -> bool:
        query = text("SELECT 1 FROM active_food_catalog WHERE report_no = :food_id LIMIT 1")
        result = await session.execute(query, {"food_id": food_id})
        return result.first() is not None

    @staticmethod
    async def add_wishlist(session: AsyncSession, user_id: int, food_id: str) -> int:
        # (user_id, food_id) UNIQUE 위반 시 IntegrityError가 올라오며 라우트에서 409로 변환
        query = text("""
            INSERT INTO wishlists (user_id, food_id)
            VALUES (:user_id, :food_id)
        """)
        result = await session.execute(query, {"user_id": user_id, "food_id": food_id})
        await session.commit()
        return result.lastrowid

    @staticmethod
    async def remove_wishlist(session: AsyncSession, user_id: int, food_id: str) -> int:
        query = text("""
            DELETE FROM wishlists
            WHERE user_id = :user_id AND food_id = :food_id
        """)
        result = await session.execute(query, {"user_id": user_id, "food_id": food_id})
        await session.commit()
        return result.rowcount
