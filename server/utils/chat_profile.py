# utils/chat_profile.py
# 레시피 챗봇 취향 프로필 검증 및 프롬프트 블록 생성
# 항목 우선순위: 1) 식이 제한(안전) 2) 보유 주방 도구 3) 요리 숙련도 · 선호 요리
import re
from typing import Any, Optional

# 프론트 userOptions.js와 동일한 허용 목록
COOKING_LEVEL_LABELS = {
    "beginner": "초보",
    "intermediate": "중급",
    "advanced": "고수",
}
APPLIANCE_OPTIONS = ["전자레인지", "에어프라이어", "인덕션", "가스레인지", "오븐", "믹서기"]
PREFERENCE_OPTIONS = ["한식", "양식", "중식", "일식", "베이킹", "건강식"]

RESTRICTIONS_MAX_LENGTH = 200
_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")
_SPACES = re.compile(r"\s+")


def sanitize_text(value: Any, max_length: int) -> str:
    """제어문자/줄바꿈을 공백으로 바꾸고 공백을 정리한 뒤 길이를 제한한다."""
    if not isinstance(value, str):
        return ""
    cleaned = _SPACES.sub(" ", _CONTROL_CHARS.sub(" ", value)).strip()
    return cleaned[:max_length]


def _pick_allowed(values: Any, allowed: list[str]) -> list[str]:
    if not isinstance(values, list):
        return []
    picked: list[str] = []
    for value in values:
        if isinstance(value, str) and value in allowed and value not in picked:
            picked.append(value)
    return picked


def normalize_profile(raw: Optional[dict]) -> Optional[dict]:
    """프론트에서 받은 profile을 검증한다. 객체가 아니면 None을 반환한다."""
    if not isinstance(raw, dict):
        return None
    level = raw.get("cookingLevel")
    if level not in COOKING_LEVEL_LABELS:
        level = "beginner"
    return {
        "cookingLevel": level,
        "appliances": _pick_allowed(raw.get("appliances"), APPLIANCE_OPTIONS),
        "preferences": _pick_allowed(raw.get("preferences"), PREFERENCE_OPTIONS),
        "restrictions": sanitize_text(raw.get("restrictions"), RESTRICTIONS_MAX_LENGTH),
    }


def _list_or_none(items: list[str]) -> str:
    return ", ".join(items) if items else "없음"


def build_profile_block(profile: dict) -> str:
    """AI에 전달할 취향 프로필 블록. 안전 항목(식이 제한)을 가장 먼저 둔다."""
    return "\n".join([
        "[사용자 취향 프로필]",
        f"1. 식이 제한 · 현재 상황 (반드시 준수): {profile['restrictions'] or '없음'}",
        f"2. 보유 주방 도구: {_list_or_none(profile['appliances'])}",
        f"3. 요리 숙련도: {COOKING_LEVEL_LABELS[profile['cookingLevel']]}",
        f"   선호 요리: {_list_or_none(profile['preferences'])}",
    ])
