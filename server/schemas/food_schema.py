from pydantic import BaseModel
from typing import List, Optional

class FoodSearchItem(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    foodCategory: Optional[str] = None
    calories: Optional[float] = 0.0
    novaGroup: int
    statusText: str
    badgeColor: str
    isUPF: bool

class FoodSearchResponse(BaseModel):
    count: int
    data: List[FoodSearchItem]

class ProductDetail(BaseModel):
    reportNo: str
    productName: str
    companyName: Optional[str] = None
    foodCategory: Optional[str] = None
    productionDate: Optional[str] = None

class NutritionDetail(BaseModel):
    calories: Optional[float] = 0.0
    carbohydrate: Optional[float] = 0.0
    protein: Optional[float] = 0.0
    fat: Optional[float] = 0.0
    sugars: Optional[float] = 0.0
    sodium: Optional[float] = 0.0
    cholesterol: Optional[float] = 0.0
    saturatedFat: Optional[float] = 0.0
    transFat: Optional[float] = 0.0

class FoodDetailResponse(BaseModel):
    product: ProductDetail
    nutrition: NutritionDetail
    materials: Optional[str] = None
    upfAnalysis: dict