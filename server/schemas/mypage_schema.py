# schemas/mypage_schema.py
# 마이페이지 통합 로그(mypage_logs) 요청/응답 스키마
from typing import Literal, Optional

from pydantic import BaseModel, Field


class RecipeLogContent(BaseModel):
    # 저장 시점의 레시피 본문(마크다운)과 맥락
    markdown: str = Field(..., min_length=1, max_length=8000)
    question: Optional[str] = Field(default=None, max_length=1000)
    sourceSessionId: Optional[str] = Field(default=None, max_length=64)


class MypageLogCreateRequest(BaseModel):
    # 현재는 레시피 보관함만 사용한다. 비교 히스토리는 comparison_logs 테이블을 사용한다.
    log_type: Literal["recipe"]
    title: str = Field(..., min_length=1, max_length=255)
    content: RecipeLogContent


class MypageLogResponse(BaseModel):
    id: int
    user_id: int
    log_type: str
    title: str
    content: dict
    created_at: str
