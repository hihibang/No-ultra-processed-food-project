# routes/chat_routes.py
# 레시피 후속 질문 처리: n8n(벡터 검색)을 거치지 않고 로컬 서버가 OpenAI Chat Completions를 직접 호출한다.
import logging
import os
import re

import httpx
from fastapi import APIRouter, Depends, HTTPException

from schemas.chat_schema import FollowupRequest, FollowupResponse
from utils.auth_utils import get_current_user
from utils.chat_profile import build_profile_block, normalize_profile, sanitize_text

logger = logging.getLogger(__name__)

# 추천 레시피는 마크다운 줄바꿈 구조가 중요하므로 줄바꿈은 살리고 제어문자만 제거한다
_RECIPE_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

router = APIRouter(prefix="/api/chat", tags=["Chat"])

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o-mini"
OPENAI_TIMEOUT_SECONDS = 60.0
HISTORY_TURNS_LIMIT = 10

SYSTEM_RULES = """당신은 초가공식품을 줄이는 건강 요리 도우미입니다.

[안전 규칙]
- 프로필의 '식이 제한 · 현재 상황'은 어떤 경우에도 지켜야 합니다. 알레르기 재료는 대체 재료를 포함해 절대 쓰지 마세요.
- 사용자가 보유하지 않은 주방 도구는 권하지 말고, 대안이 있으면 그것을 안내하세요.

[대화 규칙]
- 아래 '현재 추천 레시피'를 기준으로 답하세요. 레시피와 무관한 질문이면 그 사실을 짧게 알리고 요리 관련 질문으로 안내하세요.
- 요리 숙련도에 맞춰 설명의 상세도를 조절하세요.

[답변 형식 - 마크다운]
- 주제별로 `### 소제목`을 쓰세요. (예: `### 재료`, `### 조리 순서`, `### 팁`)
- 재료는 불릿(`- `)으로, 분량은 **굵게** 강조하세요.
- 조리 순서는 번호 목록(`1. `)으로 한 단계씩 쓰세요.
- 핵심 포인트(불 세기, 시간, 소금 양 등)는 **굵게** 표시하세요.
- 답변은 간결하게, 한 문단은 3문장 이내로 유지하세요."""


def _build_messages(body: FollowupRequest, profile: dict | None) -> list[dict]:
    system_parts = [SYSTEM_RULES]
    if profile:
        system_parts.append(build_profile_block(profile))
    if body.recipeContext:
        system_parts.append("[현재 추천 레시피]\n" + _RECIPE_CONTROL_CHARS.sub("", body.recipeContext)[:6000])

    messages: list[dict] = [{"role": "system", "content": "\n\n".join(system_parts)}]

    # 최근 대화만 전달해 토큰 사용량을 제한한다
    for item in body.history[-HISTORY_TURNS_LIMIT:]:
        messages.append({"role": item.role, "content": item.content})

    messages.append({"role": "user", "content": sanitize_text(body.question, 1000)})
    return messages


@router.post("/followup", response_model=FollowupResponse)
async def followup(
    body: FollowupRequest,
    current_user: dict = Depends(get_current_user),
):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="챗봇 서버 설정이 완료되지 않았습니다.")

    model = os.getenv("OPENAI_CHAT_MODEL", DEFAULT_MODEL)
    profile = normalize_profile(body.profile.model_dump() if body.profile else None)
    payload = {
        "model": model,
        "messages": _build_messages(body, profile),
        "temperature": 0.5,
    }

    try:
        async with httpx.AsyncClient(timeout=OPENAI_TIMEOUT_SECONDS) as client:
            response = await client.post(
                OPENAI_CHAT_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
    except httpx.HTTPError:
        logger.exception("OpenAI 요청 실패 (network)")
        raise HTTPException(status_code=502, detail="AI 응답 서버에 연결하지 못했습니다.")

    if response.status_code != 200:
        # 외부 응답 본문은 로그에만 남기고 클라이언트에는 노출하지 않는다
        logger.error("OpenAI 오류 status=%s body=%s", response.status_code, response.text[:500])
        raise HTTPException(status_code=502, detail="AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.")

    data = response.json()
    try:
        answer = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(status_code=502, detail="AI 응답 형식이 올바르지 않습니다.")

    return FollowupResponse(
        answer=answer,
        sessionId=body.sessionId,
        model=data.get("model", model),
        usage=data.get("usage"),
    )
