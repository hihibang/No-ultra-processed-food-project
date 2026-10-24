# routes/comparison_routes.py
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.comparison_model import ComparisonModel
from schemas.comparison_schema import ComparisonLogCreateRequest, ComparisonLogResponse
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/comparisons", tags=["Comparisons"])


@router.get("", response_model=List[ComparisonLogResponse])
async def get_comparisons(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ComparisonModel.get_logs_by_user(db, current_user["user_id"])


@router.post("", response_model=ComparisonLogResponse, status_code=status.HTTP_201_CREATED)
async def save_comparison(
    body: ComparisonLogCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comparison_id = await ComparisonModel.save_log(db, current_user["user_id"], body.product_ids)
    log = await ComparisonModel.find_log(db, comparison_id)
    return ComparisonLogResponse(**log)
