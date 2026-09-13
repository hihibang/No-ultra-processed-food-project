from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.recipe_model import RecipeModel
from schemas.recipe_schema import RecipeResponse

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

@router.get("/recommend", response_model=RecipeResponse)
async def recommend_recipes(
    keyword: str = Query("", description="키워드 필터"),
    db: AsyncSession = Depends(get_db)
):
    recipes = await RecipeModel.find_recommendations(db, keyword.strip())
    formatted = [
        {
            "recipe_id": int(r["recipe_id"]),
            "menu_name": r["menu_name"],
            "cooking_method": r["cooking_method"],
            "recipe_type": r["recipe_type"],
            "calories": float(r["calories"] or 0.0),
            "sodium": float(r["sodium"] or 0.0),
            "ingredients": r["ingredients"],
            "cooking_steps_desc": r["cooking_steps_desc"],
        }
        for r in recipes
    ]
    return {"count": len(formatted), "recipes": formatted}