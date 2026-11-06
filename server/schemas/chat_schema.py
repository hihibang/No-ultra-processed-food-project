# schemas/chat_schema.py
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=4000)


class ChatProfile(BaseModel):
    cookingLevel: Optional[str] = None
    appliances: list[str] = Field(default_factory=list, max_length=20)
    preferences: list[str] = Field(default_factory=list, max_length=20)
    restrictions: Optional[str] = Field(default=None, max_length=500)


class FollowupRequest(BaseModel):
    sessionId: Optional[str] = Field(default=None, max_length=64)
    question: str = Field(..., min_length=1, max_length=1000)
    recipeContext: Optional[str] = Field(default=None, max_length=6000)
    history: list[ChatHistoryItem] = Field(default_factory=list, max_length=20)
    profile: Optional[ChatProfile] = None


class FollowupResponse(BaseModel):
    answer: str
    sessionId: Optional[str] = None
    model: str
    # 프론트 요청 형식과 맞추기 위해 Any 허용
    usage: Optional[dict[str, Any]] = None
