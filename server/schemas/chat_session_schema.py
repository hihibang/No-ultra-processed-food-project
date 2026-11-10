# schemas/chat_session_schema.py
# 로그인 사용자의 챗봇 대화 세션(chat_sessions) 요청/응답 스키마
from typing import Literal, Optional

from pydantic import BaseModel, Field


class RecipeCandidateItem(BaseModel):
    title: str = Field(..., max_length=255)
    content: str = Field(..., max_length=8000)


class ChatMessageItem(BaseModel):
    # 프론트 메시지 구조와 맞춘다. 알 수 없는 필드는 무시된다.
    id: str = Field(..., min_length=1, max_length=64)
    role: Literal["user", "assistant"]
    kind: Optional[Literal["recipe", "followup"]] = None
    content: str = Field(..., max_length=8000)
    createdAt: Optional[str] = Field(default=None, max_length=40)
    candidates: Optional[list[RecipeCandidateItem]] = Field(default=None, max_length=10)
    candidateIndex: Optional[int] = None
    # 이 레시피를 마이페이지에 저장한 경우 mypage_logs.id
    savedLogId: Optional[int] = None


class ChatSessionUpsertRequest(BaseModel):
    title: str = Field(default="새로운 대화", min_length=1, max_length=255)
    messages: list[ChatMessageItem] = Field(default_factory=list, max_length=200)


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    messages: list[dict]
    createdAt: str
    updatedAt: str
