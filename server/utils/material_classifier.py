# utils/material_classifier.py
# 원재료 표시용 분류: 원재료명 나누기, 식품첨가물 판정, 주원료 → 조미·복합 → 첨가물 순 정렬.
# DB의 원재료 문자열 순서는 중량순이 아니라서(예: 연육이 맨 뒤에 오는 행이 있음) 순서에 기대지 않고 분류로 정렬한다.
# 분류 안에서는 DB 원래 순서를 유지한다.
import re
from typing import Iterable

# 식품첨가물공전 사전에 없는 이름도 잡기 위한 패턴 (제제, 나트륨·칼륨 염류, 감미료, 색소, 향료 등)
ADDITIVE_PATTERN = re.compile(
    r"제제|나트륨|칼륨|칼슘|마그네슘|인산염|글루탐산|소브산|자일로오스|소비톨|스테비|락톤|글리신"
    r"|구연산|젖산|초산|향료|색소|착색|보존료|산도조절|유화|증점|카라기난|검$|에리스리톨|말티톨"
    r"|아스파탐|수크랄로스|사카린|비타민|팽창|안정제|결합제|소포제|이산화|탄산수소|타르색소|[적황청]색\s*\d+호"
)
# 조미·복합 원료 (주원료는 아니지만 첨가물도 아닌 것)
COMPOUND_SUFFIXES = ("조미식품", "소스류", "소스", "시즈닝", "양념", "엑기스")

RANK_MAIN = 0       # 상품명에 들어 있는 주원료 (예: '[냉동] 오징어 볼'의 오징어)
RANK_RAW = 1        # 일반 원재료
RANK_COMPOUND = 2   # 복합조미식품·소스류 등
RANK_ADDITIVE = 3   # 식품첨가물


def split_materials(text: str | None) -> list[str]:
    """원재료 문자열을 항목으로 나눈다. 괄호 안 쉼표는 나누지 않고, 빈 항목·앞뒤 공백은 제거한다."""
    if not text or not text.strip():
        return []
    items, depth, current = [], 0, ""
    for char in text:
        if char in "([":
            depth += 1
        elif char in ")]":
            depth = max(0, depth - 1)
        if char in ",，" and depth == 0:
            items.append(current)
            current = ""
        else:
            current += char
    items.append(current)
    return [item.strip() for item in items if item.strip()]


def is_additive(name: str, dictionary_names: set[str]) -> bool:
    return name in dictionary_names or bool(ADDITIVE_PATTERN.search(name))


def _core(name: str) -> str:
    # 괄호 설명을 뗀 핵심 이름 ("검정깨(흑임자)" → "검정깨")
    return re.sub(r"\(.*?\)|\[.*?\]", "", name).strip()


def _rank(name: str, product_name: str, dictionary_names: set[str]) -> int:
    if is_additive(name, dictionary_names):
        return RANK_ADDITIVE
    if name.endswith(COMPOUND_SUFFIXES):
        return RANK_COMPOUND
    core = _core(name)
    if len(core) >= 2 and core in (product_name or ""):
        return RANK_MAIN
    return RANK_RAW


def order_materials(names: Iterable[str], product_name: str | None, dictionary_names: set[str]) -> list[dict]:
    """원재료를 주원료 → 일반 원료 → 복합 조미 → 첨가물 순으로 정렬해 {name, isAdditive} 목록을 돌려준다.
    같은 이름은 한 번만 남기고, 분류 안에서는 입력(DB) 순서를 유지한다."""
    seen: set[str] = set()
    ranked = []
    for index, name in enumerate(names):
        if name in seen:
            continue
        seen.add(name)
        ranked.append((_rank(name, product_name or "", dictionary_names), index, name))
    ranked.sort(key=lambda row: (row[0], row[1]))
    return [
        {"name": name, "isAdditive": rank == RANK_ADDITIVE}
        for rank, _, name in ranked
    ]
