# schemas/comparison_schema.py
from typing import List

from pydantic import BaseModel, Field


class ComparisonLogCreateRequest(BaseModel):
    # active_food_catalog.report_no 목록
    product_ids: List[str] = Field(..., min_length=1)


class ComparisonLogResponse(BaseModel):
    comparison_id: int
    user_id: int
    product_ids: List[str]
    foods: List[dict]
    created_at: str
