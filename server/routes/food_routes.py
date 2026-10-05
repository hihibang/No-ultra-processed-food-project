from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.food_model import FoodModel
from schemas.food_schema import FoodSearchResponse, FoodDetailResponse
from utils.upf_classifier import classify_food

router = APIRouter(prefix="/api/foods", tags=["Foods"])


@router.get("/search", response_model=FoodSearchResponse)
async def search_foods(
    q: Optional[str] = Query(None, description="검색어"),
    category: Optional[str] = Query("전체", description="식품 카테고리"),
    nova_grades: Optional[List[int]] = Query(None, description="NOVA 등급 다중 선택 (1~4)"),  # 👈 다중 선택 리스트 수신
    limit: int = Query(1000, description="조회 개수"),
    db: AsyncSession = Depends(get_db)
):
    search_keyword = q.strip() if q and q.strip() else ""

    rows = await FoodModel.search_foods(
        db, 
        keyword=search_keyword, 
        category=category, 
        limit=limit
    )

    results = []
    for food in rows:
        upf = classify_food(food)

        # 다중 선택된 nova_grades 배열에 해당 식품의 novaGroup이 들어있는지 확인
        if nova_grades and upf["novaGroup"] not in nova_grades:
            continue

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