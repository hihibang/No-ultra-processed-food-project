# routes/recommendation_routes.py
# 협업 필터링 추천 API. 로그인 여부에 따라 개인화 정도만 달라지며, 비로그인도 콘텐츠 기준으로 응답한다.
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.recommendation_schema import (
    CompareResponse,
    CrossDomainResponse,
    InfluencerRecipeDetail,
    InfluencerRecipeListResponse,
    InteractionCreateRequest,
    InteractionResponse,
    RecipeProductsRequest,
    RecipeProductsResponse,
    SimilarRecipesResponse,
)
from models.influencer_recipe_model import InfluencerRecipeModel
from utils import recommendation_service as service
from utils.influencer_recipe_service import influencer_recipe_candidates
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
    current_user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"] if current_user else None
    result = await service.compare_product(db, product_id, user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    return result


@router.get("/influencer-recipes", response_model=InfluencerRecipeListResponse)
async def influencer_recipes(
    limit: int = Query(2, ge=1, le=2),
    current_user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    # 레시피 답변 맥락에서 호출한다. 검수된 인플루언서 레시피만 후보로 쓰며 유저 커스텀 레시피는 포함되지 않는다.
    user_id = current_user["user_id"] if current_user else None
    items = await influencer_recipe_candidates(db, user_id, limit)
    return {"items": items}


@router.get("/influencer-recipes/{recipe_id}", response_model=InfluencerRecipeDetail)
async def influencer_recipe_detail(recipe_id: int, db: AsyncSession = Depends(get_db)):
    row = await InfluencerRecipeModel.find_verified(db, recipe_id)
    if row is None:
        raise HTTPException(status_code=404, detail="레시피를 찾을 수 없습니다.")
    return {
        "recipeId": int(row["recipe_id"]),
        "title": row["recipe_title"],
        "creatorId": row["creator_id"],
        "creatorName": row["creator_name"],
        "markdown": row["recipe_markdown"],
    }
