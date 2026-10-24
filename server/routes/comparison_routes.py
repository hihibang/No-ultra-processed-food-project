# routes/comparison_routes.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.comparison_model import ComparisonModel
from schemas.comparison_schema import (
    ComparisonDetailResponse,
    ComparisonLogCreateRequest,
    ComparisonLogResponse,
    ComparisonSaveResponse,
)
from utils.auth_utils import get_current_user
from utils.comparison_report import build_comparison_report

router = APIRouter(prefix="/api/comparisons", tags=["Comparisons"])


@router.get("", response_model=List[ComparisonLogResponse])
async def get_comparisons(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ComparisonModel.get_logs_by_user(db, current_user["user_id"])


@router.post("", response_model=ComparisonSaveResponse, status_code=status.HTTP_201_CREATED)
async def save_comparison(
    body: ComparisonLogCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"]

    rows = await ComparisonModel.find_nutrition_rows(db, body.product_ids)
    if not rows:
        raise HTTPException(status_code=404, detail="비교할 식품을 찾을 수 없습니다.")

    report = build_comparison_report(rows)
    comparison_id = await ComparisonModel.save_log(db, user_id, body.product_ids, report)
    log = await ComparisonModel.find_log(db, comparison_id)
    return ComparisonSaveResponse(**log)


@router.get("/{comparison_id}", response_model=ComparisonDetailResponse)
async def get_comparison_detail(
    comparison_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 본인 로그가 아니면 존재 여부를 드러내지 않도록 404로 응답
    log = await ComparisonModel.find_owned_log(db, current_user["user_id"], comparison_id)
    if not log:
        raise HTTPException(status_code=404, detail="비교 기록을 찾을 수 없습니다.")

    # 리포트가 없는 과거 로그는 현재 데이터 기준으로 재계산 (저장하지는 않음)
    is_recalculated = log["report"] is None
    if is_recalculated:
        rows = await ComparisonModel.find_nutrition_rows(db, log["product_ids"])
        log["report"] = build_comparison_report(rows)

    return ComparisonDetailResponse(**log, isRecalculated=is_recalculated)
