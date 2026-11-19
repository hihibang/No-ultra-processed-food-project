# routes/recommendation_routes.py
# 협업 필터링 추천 API. 로그인 여부에 따라 개인화 정도만 달라지며, 비로그인도 콘텐츠 기준으로 응답한다.
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.recommendation_schema import (
    CompareResponse,
    CrossDomainResponse,
    InteractionCreateRequest,
    InteractionResponse,
    RecipeProductsRequest,
    RecipeProductsResponse,
    SimilarRecipesResponse,
)
from utils import recommendation_service as service
from utils.auth_utils import get_current_user, get_optional_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.post("/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def record_interaction(
    body: InteractionCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 가중치는 서버에서 계산한다 (클라이언트가 점수를 조작할 수 없게)
    return await service.record_interaction(
        db, current_user["user_id"], body.item_type, body.item_id, body.action, body.label,
    )


@router.post("/recipe-products", response_model=RecipeProductsResponse)
async def recipe_products(
    body: RecipeProductsRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"] if current_user else None
    return await service.recipe_products(db, user_id, body.recipe_title, body.ingredients)


@router.get("/similar-users/recipes", response_model=SimilarRecipesResponse)
async def similar_user_recipes(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.similar_user_recipes(db, current_user["user_id"])


@router.get("/cross-domain", response_model=CrossDomainResponse)
async def cross_domain(
    target_type: Literal["influencer", "recipe"] = Query(...),
    target_id: str = Query(..., min_length=1, max_length=255),
    db: AsyncSession = Depends(get_db),
):
    return await service.cross_domain(db, target_type, target_id)


@router.get("/products/{product_id}/compare", response_model=CompareResponse)
async def compare_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await service.compare_product(db, product_id)
    if result is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    return result
