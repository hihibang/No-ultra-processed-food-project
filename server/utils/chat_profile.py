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


STOVE_APPLIANCES = ("인덕션", "가스레인지")

# 불(인덕션/가스레인지)이 있어야만 가능한 조리를 나타내는 표현. 보유 도구에 불이 없을 때 답변에 나오면 위반으로 본다.
_HEAT_COOKING_PATTERN = re.compile(
    r"프라이팬|후라이팬|팬에|팬을|팬이|웍|냄비|가스\s*불|가스레인지|인덕션|불을\s*(켜|올)|약\s*불|중\s*불|센\s*불|강\s*불|중약\s*불"
    r"|끓이|끓여|끓인|끓어|볶아|볶으|볶다|볶은\s*(뒤|후)|튀기|튀겨|부치|지져|지지|삶아|삶은|굽다|구워"
)
# 도구 이름 뒤에 이런 표현이 붙으면 "쓰지 않는다"는 안내이므로 위반으로 보지 않는다
_NEGATION_AFTER = re.compile(r"^.{0,8}(없이|불가|대신|사용하지|쓰지|필요 ?없|필요하지)")


def split_appliances(profile: dict) -> tuple[list[str], list[str]]:
    """(사용 가능, 사용 불가). 체크하지 않은 도구는 보유하지 않은 것으로 본다. 아무것도 체크하지 않았으면 제한하지 않는다."""
    owned = profile["appliances"]
    if not owned:
        return [], []
    return owned, [name for name in APPLIANCE_OPTIONS if name not in owned]


def has_stove(profile: dict) -> bool:
    owned = profile["appliances"]
    return not owned or any(name in owned for name in STOVE_APPLIANCES)


def build_appliance_rules(profile: dict) -> list[str]:
    usable, unusable = split_appliances(profile)
    if not usable:
        return []
    rules = [
        f"- 사용 가능한 조리도구는 {', '.join(usable)} 뿐입니다. 이 도구만으로 완성되는 레시피만 제안하세요.",
        f"- 사용 불가 도구({', '.join(unusable)})는 보유하지 않은 것입니다. 재료 손질·조리 단계 어디에도 쓰지 마세요.",
    ]
    if not has_stove(profile):
        rules.append(
            "- 불을 쓰는 조리(팬 굽기·볶기·끓이기·튀기기·삶기, 냄비·프라이팬·인덕션·가스레인지 사용)는 절대 제안하지 마세요. "
            + ("전자레인지 전용 용기·머그컵·찜기로 완성되는 조리법만 쓰세요. " if "전자레인지" in usable else "")
            + "사용자가 불이 필요한 메뉴를 물으면 사용 가능한 도구로 만드는 대체 조리법이나 비슷한 메뉴를 안내하세요."
        )
    return rules


def find_appliance_violations(text: str, profile: Optional[dict]) -> list[str]:
    """답변이 사용 불가 도구·불 조리를 쓰면 해당 표현 목록을 돌려준다 (없으면 빈 목록)."""
    if not profile or not text:
        return []
    usable, unusable = split_appliances(profile)
    if not usable:
        return []
    found: list[str] = []
    if not has_stove(profile):
        found += [m.group(0) for m in _HEAT_COOKING_PATTERN.finditer(text)]
    for name in unusable:
        for m in re.finditer(name, text):
            if not _NEGATION_AFTER.match(text[m.end():m.end() + 12]):
                found.append(name)
    return list(dict.fromkeys(found))


def build_profile_block(profile: dict) -> str:
    """AI에 전달할 취향 프로필 블록. 안전 항목(식이 제한)을 가장 먼저 둔다."""
    usable, unusable = split_appliances(profile)
    appliance_lines = (
        [f"2. 사용 가능한 주방 도구 (이것만 사용): {', '.join(usable)}",
         f"   사용 불가 주방 도구 (보유하지 않음, 절대 사용 금지): {', '.join(unusable) or '없음'}"]
        if usable else ["2. 보유 주방 도구: 지정 안 함"]
    )
    return "\n".join([
        "[사용자 취향 프로필]",
        f"1. 식이 제한 · 현재 상황 (반드시 준수): {profile['restrictions'] or '없음'}",
        *appliance_lines,
        f"3. 요리 숙련도: {COOKING_LEVEL_LABELS[profile['cookingLevel']]}",
        f"   선호 요리: {_list_or_none(profile['preferences'])}",
    ])
