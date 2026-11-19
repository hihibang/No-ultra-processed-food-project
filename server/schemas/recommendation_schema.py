# schemas/recommendation_schema.py
# 추천 API 요청/응답 스키마. 프론트 api/recommendationApi.js 와 필드 이름을 맞춘다.
from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


class InteractionCreateRequest(BaseModel):
    item_type: Literal["product", "recipe", "influencer"]
    item_id: str = Field(..., min_length=1, max_length=255)
    action: Literal["view", "click", "compare", "wish", "save"]
    label: Optional[str] = Field(default=None, max_length=255)


class InteractionResponse(BaseModel):
    id: int
    item_type: str
    item_id: str
    action: str
    weight: float


class RecipeProductsRequest(BaseModel):
    recipe_title: str = Field(..., min_length=1, max_length=255)
    ingredients: Union[list[str], str] = Field(default_factory=list)


class ProductRecommendation(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    imageUrl: Optional[str] = None
    novaGroup: int
    statusText: Optional[str] = None
    healthScore: int
    nutrition: dict
    isWished: bool
    cfScore: float
    badges: list[str]


class RecipeProductsResponse(BaseModel):
    strategy: Literal["collaborative", "content", "none"]
    items: list[ProductRecommendation]


class SimilarRecipe(BaseModel):
    key: str
    title: str
    markdown: Optional[str] = None
    matchRate: Optional[int] = None
    supporters: int
    reason: str
    badges: list[str]


class SimilarRecipesResponse(BaseModel):
    strategy: Literal["collaborative", "popular"]
    items: list[SimilarRecipe]


class CrossDomainProduct(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    imageUrl: Optional[str] = None
    novaGroup: int
    healthScore: int
    fanWishCount: int


class CrossDomainRecipe(BaseModel):
    key: str
    title: str
    markdown: Optional[str] = None
    fanWishCount: int


class CrossDomainResponse(BaseModel):
    strategy: Literal["fan_cf", "popular"]
    fanCount: int
    products: list[CrossDomainProduct]
    recipes: list[CrossDomainRecipe]


class CompareProduct(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    imageUrl: Optional[str] = None
    novaGroup: int
    statusText: Optional[str] = None
    healthScore: int
    nutrition: dict
    healthDiff: Optional[int] = None
    selectionRate: Optional[int] = None
    isUpgrade: bool = False
    upgradeReasons: list[str] = []


class CompareBaseProduct(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    imageUrl: Optional[str] = None
    novaGroup: int
    statusText: Optional[str] = None
    healthScore: int
    nutrition: dict


class CompareResponse(BaseModel):
    baseProduct: CompareBaseProduct
    sampleSize: int
    headline: Optional[str] = None
    alternatives: list[CompareProduct]
    topSelected: list[CompareProduct]
    similarUserWishlists: list["SimilarUserWishlist"] = []


class WishedItem(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    imageUrl: Optional[str] = None


class SimilarUserWishlist(BaseModel):
    userLabel: str
    matchedProductName: str
    matchedCount: int
    scope: Literal["compare_group", "same_type"]
    wishedItems: list[WishedItem]


class InfluencerRecipeItem(BaseModel):
    recipeId: int
    title: str
    creatorId: str
    creatorName: str
    source: Literal["followed_influencer", "similar_user_influencer"]
    badge: str


class InfluencerRecipeListResponse(BaseModel):
    items: list[InfluencerRecipeItem]


class InfluencerRecipeDetail(BaseModel):
    recipeId: int
    title: str
    creatorId: str
    creatorName: str
    markdown: str

