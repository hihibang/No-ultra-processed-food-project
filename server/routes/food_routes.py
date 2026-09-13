from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.food_model import FoodModel
from schemas.food_schema import FoodSearchResponse, FoodDetailResponse
from utils.upf_classifier import classify_food

router = APIRouter(prefix="/api/foods", tags=["Foods"])

@router.get("/search", response_model=FoodSearchResponse)
async def search_foods(
    q: str = Query(..., min_length=1, description="검색어"),
    db: AsyncSession = Depends(get_db)
):
    rows = await FoodModel.search_foods(db, q.strip())
    results = []
    for food in rows:
        upf = classify_food(food)
        results.append({
            "reportNo": str(food["report_no"]),
            "productName": food["product_name"],
            "companyName": food["company_name"],
            "foodCategory": food["product_type"],
            "calories": float(food["calories"] or 0.0),
            "novaGroup": upf["novaGroup"],
            "statusText": upf["statusText"],
            "badgeColor": upf["badgeColor"],
            "isUPF": upf["isUPF"],
        })
    return {"count": len(results), "data": results}

@router.get("/{report_no}", response_model=FoodDetailResponse)
async def get_food_detail(
    report_no: str,
    db: AsyncSession = Depends(get_db)
):
    food = await FoodModel.find_by_report_no(db, report_no.strip())
    if not food:
        raise HTTPException(status_code=404, detail="식품을 찾을 수 없습니다.")

    upf = classify_food(food)

    return {
        "product": {
            "reportNo": str(food["report_no"]),
            "productName": food["product_name"],
            "companyName": food["company_name"],
            "foodCategory": food["product_type"],
            "productionDate": str(food["latest_date"]) if food["latest_date"] else None,
        },
        "nutrition": {
            "calories": float(food["calories"] or 0.0),
            "carbohydrate": float(food["carbohydrate"] or 0.0),
            "protein": float(food["protein"] or 0.0),
            "fat": float(food["fat"] or 0.0),
            "sugars": float(food["sugars"] or 0.0),
            "sodium": float(food["sodium"] or 0.0),
            "cholesterol": float(food["cholesterol"] or 0.0),
            "saturatedFat": float(food["saturated_fat"] or 0.0),
            "transFat": float(food["trans_fat"] or 0.0),
        },
        "materials": food["raw_materials"],
        "upfAnalysis": upf,
    }