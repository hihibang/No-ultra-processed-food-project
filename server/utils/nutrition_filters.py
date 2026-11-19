# utils/nutrition_filters.py
# 통합 식품 필터(영양성분 강조 기준 + 제외 첨가물)의 판정 로직. DB 값은 100g(고형) / 100mL(액체) 기준으로 저장되어 있다.
# 필터 여러 개는 AND 조건이다: 선택한 영양 기준을 모두 충족하고, 선택한 첨가물 키워드가 하나도 없어야 한다.
import math
import re
from typing import Iterable, Mapping, Optional

# 식약처 영양성분 강조표시 기준 (고형 100g / 액체 100mL)
NUTRITION_RULES = {
    # 저당: 당류 5g 미만 (액체 2.5g 미만)
    "lowSugar": ("sugars", "lt", 5.0, 2.5),
    # 무트랜스지방: 트랜스지방 0.2g 미만
    "zeroTransFat": ("trans_fat", "lt", 0.2, 0.2),
    # 저나트륨: 나트륨 120mg 미만
    "lowSodium": ("sodium", "lt", 120.0, 120.0),
    # 고단백: 단백질 11g 이상 (액체 5.5g 이상)
    "highProtein": ("protein", "gte", 11.0, 5.5),
}

# 제외할 첨가물: 원재료 텍스트에 키워드가 하나라도 포함되면 제외 (대소문자 무시)
EXCLUDED_ADDITIVE_KEYWORDS = {
    "noSweetener": ["아스파탐", "수크랄로스", "아세설팜칼륨", "사카린나트륨", "네오탐", "어드밴탐", "합성감미료"],
    "noPreservative": ["소브산칼륨", "소브산", "안식향산나트륨", "안식향산", "프로피온산",
                       "파라옥시안식향산", "아황산나트륨", "합성보존료", "보존료"],
    "noColorant": ["식용색소", "적색제", "황색제", "청색제", "녹색제", "타르색소", "합성착색료", "합성색소"],
    "noFlavorEnhancer": ["L-글루탐산나트륨", "글루탐산나트륨", "향미증진제", "MSG"],
}

_LIQUID_UNIT = re.compile(r"\d\s*(ml|l)\s*$", re.IGNORECASE)


def is_liquid(total_weight: Optional[str]) -> bool:
    """총량 표기(예: '600ml', '220g')로 액체 기준(100mL)인지 판단한다. 단위를 알 수 없으면 고형으로 본다."""
    return bool(total_weight) and bool(_LIQUID_UNIT.search(str(total_weight)))


def _number(value) -> Optional[float]:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(number) else number


def passes_nutrition(row: Mapping, filter_id: str) -> bool:
    column, op, solid_limit, liquid_limit = NUTRITION_RULES[filter_id]
    value = _number(row.get(column))
    if value is None:  # NULL이나 숫자가 아니면 해당 필터에서 제외
        return False
    limit = liquid_limit if is_liquid(row.get("total_weight")) else solid_limit
    return value < limit if op == "lt" else value >= limit


def contains_excluded_additive(raw_materials: Optional[str], filter_id: str) -> bool:
    text = (raw_materials or "").lower()
    return any(keyword.lower() in text for keyword in EXCLUDED_ADDITIVE_KEYWORDS[filter_id])


def passes_filters(row: Mapping, nutrition_ids: Iterable[str], excluded_additive_ids: Iterable[str]) -> bool:
    """선택된 영양 필터는 모두 충족, 선택된 첨가물 제외는 모두 통과해야 한다 (AND)."""
    for filter_id in nutrition_ids:
        if filter_id in NUTRITION_RULES and not passes_nutrition(row, filter_id):
            return False
    for filter_id in excluded_additive_ids:
        if filter_id in EXCLUDED_ADDITIVE_KEYWORDS and contains_excluded_additive(row.get("raw_materials"), filter_id):
            return False
    return True
