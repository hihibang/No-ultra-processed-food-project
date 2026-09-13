from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class RecipeModel:
    @staticmethod
    async def find_recommendations(session: AsyncSession, keyword: str = "") -> list:
        if keyword:
            sql = text("""
                SELECT 
                    recipe_id,
                    menu_name,
                    cooking_method,
                    recipe_type,
                    calories,
                    sodium,
                    ingredients,
                    cooking_steps_desc
                FROM recipe
                WHERE menu_name LIKE :keyword OR recipe_type LIKE :keyword OR ingredients LIKE :keyword
                ORDER BY RAND()
                LIMIT 3
            """)
            result = await session.execute(sql, {"keyword": f"%{keyword}%"})
        else:
            sql = text("""
                SELECT 
                    recipe_id,
                    menu_name,
                    cooking_method,
                    recipe_type,
                    calories,
                    sodium,
                    ingredients,
                    cooking_steps_desc
                FROM recipe
                ORDER BY RAND()
                LIMIT 3
            """)
            result = await session.execute(sql)

        return [dict(row._mapping) for row in result.fetchall()]