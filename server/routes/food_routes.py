from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.food_model import FoodModel
from schemas.food_schema import FoodSearchResponse, FoodDetailResponse
from utils.upf_classifier import classify_food

router = APIRouter(prefix="/api/foods", tags=["Foods"])


def _to_food_item(food: dict, upf: dict) -> dict:
    return {
        "reportNo": str(food["report_no"]),
        "productName": food["product_name"],
        "companyName": food["company_name"],
        "foodCategory": food["product_type"],
        "calories": float(food["calories"] or 0.0),
        "imageUrl": food.get("image_url"),
        "novaGroup": upf["novaGroup"],
        "statusText": upf["statusText"],
        "badgeColor": upf["badgeColor"],
        "isUPF": upf["isUPF"],
    }


@router.get("/search", response_model=FoodSearchResponse)
async def search_foods(
    q: Optional[str] = Query(None, description="검색어"),
    category: Optional[str] = Query("전체", description="식품 카테고리"),
    nova_grades: Optional[List[int]] = Query(None, description="NOVA 등급 다중 선택 (1~4)"),
    db: AsyncSession = Depends(get_db)
):
    search_keyword = q.strip() if q and q.strip() else ""

    # limit 전달 없이 전체 데이터 조회
    rows = await FoodModel.search_foods(
        db,
        keyword=search_keyword,
        category=category
    )

    results = []
    for food in rows:
        upf = classify_food(food)

        if nova_grades and upf["novaGroup"] not in nova_grades:
            continue

        results.append(_to_food_item(food, upf))

    return {"count": len(results), "data": results}


@router.get("/recent", response_model=FoodSearchResponse)
async def get_recent_foods(
    limit: int = Query(5, ge=1, le=20, description="조회 개수 (1~20)"),
    db: AsyncSession = Depends(get_db),
):
    rows = await FoodModel.get_recent_foods(db, limit=limit)
    results = [_to_food_item(food, classify_food(food)) for food in rows]
    return {"count": len(results), "data": results}
