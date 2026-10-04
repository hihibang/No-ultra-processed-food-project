# models/food_model.py
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# 수정된 카테고리 매핑 딕셔너리
CATEGORY_MAP = {
    "베이커리": ["빵류"],
    "음료/티": ["음료베이스", "액상차", "커피", "혼합음료", "과.채주스", "과.채음료", "탄산음료"],
    "디저트/스낵": ["초콜릿", "초콜릿가공품", "빙과", "과자", "캔디류"],  # 통합 반영
    "신선식품": ["어묵", "식육함유가공품"],
    "간편식": ["즉석조리식품", "즉석섭취식품", "간편조리세트", "만두", "숙면", "유탕면"],
    "소스/양념": ["소스", "복합조미식품"],
}

class FoodModel:
    @staticmethod
    async def search_foods(
        session: AsyncSession, 
        keyword: str = "", 
        category: str = "전체", 
        limit: int = 150
    ) -> list:
        query_conditions = []
        params = {"limit": limit}

        # 1. 키워드 검색
        if keyword and keyword.strip():
            query_conditions.append("(product_name LIKE :keyword OR company_name LIKE :keyword)")
            params["keyword"] = f"%{keyword.strip()}%"

        # 2. 카테고리 그룹 매핑 검색
        if category and category != "전체" and category in CATEGORY_MAP:
            cat_list = CATEGORY_MAP[category]
            cat_placeholders = [f":cat_{i}" for i in range(len(cat_list))]
            query_conditions.append(f"product_type IN ({', '.join(cat_placeholders)})")
            
            for i, cat_val in enumerate(cat_list):
                params[f"cat_{i}"] = cat_val

        where_clause = " WHERE " + " AND ".join(query_conditions) if query_conditions else ""

        sql = text(f"""
            SELECT 
                report_no,
                product_name,
                company_name,
                product_type,
                calories,
                sugars,
                sodium,
                saturated_fat,
                raw_materials
            FROM active_food_catalog
            {where_clause}
            LIMIT :limit
        """)

        result = await session.execute(sql, params)
        return [dict(row._mapping) for row in result.fetchall()]