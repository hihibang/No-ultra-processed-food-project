# utils/compare_upgrade.py
# 상품 비교 고도화 (순수 계산): 상위 호환(업그레이드) 후보와 유사 취향 유저의 찜 리스트.
from typing import Iterable, Optional

UPGRADE_LIMIT = 3
SIMILAR_USER_LIMIT = 3
WISHED_ITEMS_PER_USER = 4
MIN_WISHERS = 2          # 찜 유저가 이보다 적으면 범위를 넓히고, 그래도 적으면 섹션을 숨긴다
SUGAR_GAIN_G = 1.0       # 당류가 이만큼 이상 줄면 '당류 감소'
SODIUM_GAIN_MG = 100.0   # 나트륨이 이만큼 이상 줄면 '나트륨 감소'


def upgrade_reasons(base: dict, item: dict) -> list[str]:
    """기준 상품 대비 개선 포인트. 건강 점수·당류·나트륨·NOVA·주의 성분 기준."""
    reasons: list[str] = []
    diff = item["healthScore"] - base["healthScore"]
    if diff > 0:
        reasons.append(f"건강점수 +{diff}점")
    if base["nutrition"]["sugars"] - item["nutrition"]["sugars"] >= SUGAR_GAIN_G:
        reasons.append("당류 감소")
    if base["nutrition"]["sodium"] - item["nutrition"]["sodium"] >= SODIUM_GAIN_MG:
        reasons.append("나트륨 감소")
    if item["novaGroup"] < base["novaGroup"]:
        reasons.append("NOVA 등급 개선")
    if len(item.get("detectedMarkers") or []) < len(base.get("detectedMarkers") or []):
        reasons.append("주의 성분 감소")
    return reasons


def pick_upgrades(base: dict, pool: Iterable[dict], limit: int = UPGRADE_LIMIT) -> list[tuple[dict, list[str]]]:
    """기준 상품보다 건강 점수가 같거나 높고 개선 포인트가 하나 이상인 상품만 고른다.
    정렬: 건강 점수 차이 큰 순 → 개선 포인트 많은 순. 기준 상품이 이미 최상위권이면 빈 목록."""
    candidates = []
    for item in pool:
        if item["reportNo"] == base["reportNo"]:
            continue
        if item["healthScore"] < base["healthScore"]:
            continue
        reasons = upgrade_reasons(base, item)
        if reasons:
            candidates.append((item, reasons))
    candidates.sort(key=lambda pair: (
        -(pair[0]["healthScore"] - base["healthScore"]), -len(pair[1]), pair[0]["reportNo"],
    ))
    return candidates[:limit]


def similar_user_wishlists(
    wished: dict,
    affinity: dict,
    group_keys: set,
    same_type_keys: set,
    names: dict,
    current_user_id: Optional[int],
    matched_name_for: Optional[dict] = None,
    limit_users: int = SIMILAR_USER_LIMIT,
    items_per_user: int = WISHED_ITEMS_PER_USER,
) -> list[dict]:
    """비교 상품군(또는 같은 유형)을 찜한 다른 유저의 찜 리스트 카드.
    찜 유저가 2명 미만이면 같은 유형까지 범위를 넓히고, 그래도 2명 미만이면 []를 돌려준다. 가짜 데이터는 만들지 않는다."""

    def wishers_for(keys: set) -> dict[int, set]:
        result = {}
        for user_id, user_wished in wished.items():
            if user_id == current_user_id:
                continue
            matched = {key for key in user_wished if key in keys}
            if matched:
                result[user_id] = matched
        return result

    def other_items(user_id: int) -> list[tuple]:
        # 해당 유저가 찜한 다른 상품 (비교 상품군 제외, 이름을 알 수 있는 것만), 선호도 높은 순
        keys = [k for k in wished.get(user_id, set())
                if k[0] == "product" and k not in group_keys and k[1] in names]
        keys.sort(key=lambda k: (-affinity.get(user_id, {}).get(k, 0.0), k[1]))
        return keys[:items_per_user]

    scope = "compare_group"
    wishers = {}
    for user_id, matched in wishers_for(group_keys).items():
        if other_items(user_id):
            wishers[user_id] = matched
    if len(wishers) < MIN_WISHERS:
        scope = "same_type"
        wishers = {}
        for user_id, matched in wishers_for(group_keys | same_type_keys).items():
            if other_items(user_id):
                wishers[user_id] = matched
    if len(wishers) < MIN_WISHERS:
        return []

    ordered = sorted(wishers, key=lambda u: (-len(wishers[u]), u))[:limit_users]
    cards = []
    for index, user_id in enumerate(ordered):
        matched = sorted(wishers[user_id], key=lambda k: (-affinity.get(user_id, {}).get(k, 0.0), k[1]))
        first = names.get(matched[0][1], {}) if matched else {}
        cards.append({
            "userLabel": f"찜 취향 유저 {chr(ord('A') + index)}",  # 실제 유저 ID·이름은 노출하지 않는다
            "matchedProductName": first.get("productName", ""),
            "matchedCount": len(matched),
            "scope": scope,
            "wishedItems": [
                {
                    "reportNo": key[1],
                    "productName": names[key[1]]["productName"],
                    "companyName": names[key[1]].get("companyName"),
                    "imageUrl": names[key[1]].get("imageUrl"),
                }
                for key in other_items(user_id)
            ],
        })
    return cards
