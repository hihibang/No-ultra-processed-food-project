from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class FoodModel:
    @staticmethod
    async def search_foods(session: AsyncSession, keyword: str) -> list:
        sql = text("""
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
            WHERE product_name LIKE :keyword OR company_name LIKE :keyword
            LIMIT 20
        """)
        result = await session.execute(sql, {"keyword": f"%{keyword}%"})
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    async def find_by_report_no(session: AsyncSession, report_no: str) -> dict | None:
        sql = text("""
            SELECT 
                report_no,
                product_name,
                company_name,
                product_type,
                latest_date,
                calories,
                carbohydrate,
                protein,
                fat,
                sugars,
                sodium,
                cholesterol,
                saturated_fat,
                trans_fat,
                raw_materials
            FROM active_food_catalog
            WHERE report_no = :report_no
            LIMIT 1
        """)
        result = await session.execute(sql, {"report_no": report_no})
        row = result.fetchone()
        return dict(row._mapping) if row else None