# models/recommendation_model.py
# 추천 엔진이 쓰는 상품 카탈로그 조회 (active_food_catalog)
from typing import List, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

CATALOG_COLUMNS = """
    report_no, product_name, normalized_name, company_name, product_type, raw_materials,
    image_url, calories, carbohydrate, protein, fat, sugars, sodium, saturated_fat, trans_fat, cholesterol
"""


class RecommendationCatalogModel:
    @staticmethod
    async def search_by_keywords(
        session: AsyncSession,
        keywords: List[str],
        limit: int,
        product_types: Sequence[str],
    ) -> List[dict]:
        if not keywords or not product_types:
            return []
        params = {f"kw_{i}": f"%{kw}%" for i, kw in enumerate(keywords)}
        conditions = " OR ".join(
            f"(product_name LIKE :kw_{i} OR normalized_name LIKE :kw_{i})" for i in range(len(keywords))
        )
        type_placeholders = ", ".join(f":type_{i}" for i in range(len(product_types)))
        params.update({f"type_{i}": t for i, t in enumerate(product_types)})
        result = await session.execute(
            text(f"""
                SELECT {CATALOG_COLUMNS}
                FROM active_food_catalog
                WHERE image_url IS NOT NULL AND image_url != ''
                  AND product_type IN ({type_placeholders})
                  AND ({conditions})
                ORDER BY CHAR_LENGTH(product_name) ASC
                LIMIT :limit
            """),
            {**params, "limit": limit},
        )
        return [dict(row) for row in result.mappings().all()]

    @staticmethod
    async def find_by_ids(session: AsyncSession, report_nos: List[str]) -> List[dict]:
        if not report_nos:
            return []
        placeholders = ", ".join(f":id_{i}" for i in range(len(report_nos)))
        params = {f"id_{i}": rn for i, rn in enumerate(report_nos)}
        result = await session.execute(
            text(f"SELECT {CATALOG_COLUMNS} FROM active_food_catalog WHERE report_no IN ({placeholders})"),
            params,
        )
        by_id = {str(row["report_no"]): dict(row) for row in result.mappings().all()}
        return [by_id[rn] for rn in report_nos if rn in by_id]

    @staticmethod
    async def find_by_id(session: AsyncSession, report_no: str) -> Optional[dict]:
        rows = await RecommendationCatalogModel.find_by_ids(session, [report_no])
        return rows[0] if rows else None

    @staticmethod
    async def find_same_type_near(
        session: AsyncSession,
        product_type: str | None,
        calories: float,
        exclude_id: str,
        limit: int,
    ) -> List[dict]:
        # 같은 품목 유형 안에서 열량이 가까운 상품부터 후보로 가져온다 (건강 점수 비교 전 1차 후보)
        result = await session.execute(
            text(f"""
                SELECT {CATALOG_COLUMNS}
                FROM active_food_catalog
                WHERE product_type <=> :product_type
                  AND report_no != :exclude_id
                  AND image_url IS NOT NULL AND image_url != ''
                ORDER BY ABS(COALESCE(calories, 0) - :calories) ASC
                LIMIT :limit
            """),
            {"product_type": product_type, "exclude_id": exclude_id, "calories": calories, "limit": limit},
        )
        return [dict(row) for row in result.mappings().all()]
