# routes/mypage_routes.py
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.mypage_model import MypageLogModel
from schemas.mypage_schema import MypageLogCreateRequest, MypageLogResponse
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/mypage/logs", tags=["MyPage"])


@router.get("", response_model=List[MypageLogResponse])
async def list_logs(
    log_type: Literal["recipe"] = Query("recipe"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MypageLogModel.list_by_user(db, current_user["user_id"], log_type)


@router.post("", response_model=MypageLogResponse, status_code=status.HTTP_201_CREATED)
async def create_log(
    body: MypageLogCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"]
    log_id = await MypageLogModel.create(
        db,
        user_id,
        body.log_type,
        body.title.strip(),
        body.content.model_dump(exclude_none=True),
    )
    created = await MypageLogModel.find_owned(db, user_id, log_id)
    return created


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    log_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await MypageLogModel.delete(db, current_user["user_id"], log_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="보관함에서 찾을 수 없는 항목입니다.")
