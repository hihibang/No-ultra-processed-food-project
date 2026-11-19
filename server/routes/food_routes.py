from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.food_model import FoodModel
from models.recommendation_model import RecommendationCatalogModel
from schemas.food_schema import FoodSearchResponse, FoodDetailResponse
from utils.comparison_report import build_comparison_item
from utils.material_classifier import order_materials, split_materials
from utils.nutrition_filters import passes_filters
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
    nutrition: Optional[List[str]] = Query(None, description="영양 필터 다중 선택 (lowSugar, zeroTransFat, lowSodium, highProtein). AND 조건"),
    exclude_additives: Optional[List[str]] = Query(None, description="제외 첨가물 다중 선택 (noSweetener, noPreservative, noColorant, noFlavorEnhancer). AND 조건"),
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

        if not passes_filters(food, nutrition or [], exclude_additives or []):
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


# 상품 상세 페이지용. 반드시 /search, /recent 뒤에 둬야 해당 경로가 여기로 잡히지 않는다.
@router.get("/{report_no}", response_model=FoodDetailResponse)
async def get_food_detail(report_no: str, db: AsyncSession = Depends(get_db)):
    row = await RecommendationCatalogModel.find_by_id(db, report_no)
    if row is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    upf = classify_food(row)
    item = build_comparison_item(row)
    return {
        "product": {
            "reportNo": str(row["report_no"]),
            "productName": row["product_name"],
            "companyName": row["company_name"],
            "foodCategory": row["product_type"],
            "imageUrl": row.get("image_url"),
            "productionDate": None,
        },
        "nutrition": {
            "calories": float(row["calories"] or 0.0),
            "carbohydrate": float(row["carbohydrate"] or 0.0),
            "protein": float(row["protein"] or 0.0),
            "fat": float(row["fat"] or 0.0),
            "sugars": float(row["sugars"] or 0.0),
            "sodium": float(row["sodium"] or 0.0),
            "cholesterol": float(row["cholesterol"] or 0.0),
            "saturatedFat": float(row["saturated_fat"] or 0.0),
            "transFat": float(row["trans_fat"] or 0.0),
        },
        "materials": row.get("raw_materials"),
        "materialList": order_materials(
            split_materials(row.get("raw_materials")),
            row.get("product_name"),
            await FoodModel.get_additive_names(db),
        ),
        "upfAnalysis": {
            **upf,
            "healthScore": item["healthScore"],
            "scoreBreakdown": item["scoreBreakdown"],
            "detectedMarkers": item["detectedMarkers"],
        },
    }
