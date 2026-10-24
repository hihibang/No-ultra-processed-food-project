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


class ComparisonSaveResponse(ComparisonLogResponse):
    # 저장 직후 응답: 방금 계산한 리포트를 그대로 포함
    report: dict


class ComparisonDetailResponse(ComparisonLogResponse):
    report: dict
    # 저장된 리포트가 없어 현재 데이터 기준으로 다시 계산한 경우 True
    isRecalculated: bool = False
