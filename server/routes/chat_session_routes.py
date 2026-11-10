# routes/chat_session_routes.py
# 로그인 사용자 전용 대화 기록 API. 비로그인 사용자는 이 API를 호출하지 않는다.
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.chat_session_model import ChatSessionModel
from schemas.chat_session_schema import ChatSessionResponse, ChatSessionUpsertRequest
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/chat/sessions", tags=["Chat Sessions"])

SessionId = Path(..., min_length=1, max_length=64)


@router.get("", response_model=List[ChatSessionResponse])
async def list_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ChatSessionModel.list_by_user(db, current_user["user_id"])


@router.put("/{session_id}", response_model=ChatSessionResponse)
async def upsert_session(
    body: ChatSessionUpsertRequest,
    session_id: str = SessionId,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    messages = [message.model_dump(exclude_none=True) for message in body.messages]
    try:
        saved = await ChatSessionModel.upsert(db, current_user["user_id"], session_id, body.title, messages)
    except IntegrityError:
        # 동시에 같은 ID로 생성 요청이 들어온 경우
        await db.rollback()
        raise HTTPException(status_code=409, detail="대화 저장이 충돌했습니다. 다시 시도해 주세요.")

    if saved is None:
        raise HTTPException(status_code=404, detail="대화를 찾을 수 없습니다.")
    return saved


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str = SessionId,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await ChatSessionModel.delete(db, current_user["user_id"], session_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="대화를 찾을 수 없습니다.")
