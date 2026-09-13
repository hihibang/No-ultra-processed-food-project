import re

# UPF 판정용 핵심 공업용 첨가물 마커 (NOVA 4 시그니처)
UPF_MARKERS = {
    "SWEETENER": {
        "label": "인공/대체 감미료",
        "weight": 3,
        "pattern": re.compile(r"수크랄로스|아스파탐|아세설팜칼륨|사카린나트륨|에리스리톨|말티톨|소르비톨|스테비올배당체", re.IGNORECASE),
    },
    "FLAVOR_ENHANCER": {
        "label": "향미증진제",
        "weight": 2,
        "pattern": re.compile(r"L-글루탐산나트륨|리보뉴클레오티드|이노신산|구아닐산|호박산이나트륨", re.IGNORECASE),
    },
    "COLORANT": {
        "label": "인공/합성 색소",
        "weight": 2,
        "pattern": re.compile(r"타르색소|적색\s*\d+호|황색\s*\d+호|청색\s*\d+호|카라멜색소", re.IGNORECASE),
    },
    "EMULSIFIER_THICKENER": {
        "label": "유화제/증점안정제",
        "weight": 2,
        "pattern": re.compile(r"카라기난|잔탄검|구아검|폴리소르베이트|글리세린지방산에스테르|카르복시메틸셀룰로오스", re.IGNORECASE),
    },
    "AROMA": {
        "label": "합성향료",
        "weight": 2,
        "pattern": re.compile(r"합성향료|바닐린|착향료", re.IGNORECASE),
    },
    "INDUSTRIAL_EXTRACT": {
        "label": "산업용 가공물/변성전분",
        "weight": 3,
        "pattern": re.compile(r"변성전분|초산전분|산화전분|가수분해단백질|단백가수분해물|말토덱스트린|고과당콘시럽|액상과당", re.IGNORECASE),
    },
}

SAFE_ADDITIVE_PATTERN = re.compile(r"비타민|난각칼슘|효모|탄산수소나트륨|구연산|젖산|정제염", re.IGNORECASE)

def classify_food(food_data: dict) -> dict:
    raw_materials = str(food_data.get("raw_materials") or "")
    calories = float(food_data.get("calories") or 0.0)
    sugars = float(food_data.get("sugars") or 0.0)
    sodium = float(food_data.get("sodium") or 0.0)
    saturated_fat = float(food_data.get("saturated_fat") or 0.0)

    detected_markers = []
    upf_score = 0

    # 1. 공업용 첨가물(UPF 마커) 검출
    for key, marker in UPF_MARKERS.items():
        if marker["pattern"].search(raw_materials):
            detected_markers.append(marker["label"])
            upf_score += marker["weight"]

    # 2. 고위험 영양성분 프로파일 가산점 (식약처/WHO 기준치 반영)
    nutrition_warnings = []
    if sugars >= 15.0:
        upf_score += 2
        nutrition_warnings.append("고당류 식품")
    if sodium >= 800.0:
        upf_score += 2
        nutrition_warnings.append("고나트륨 식품")
    if saturated_fat >= 5.0:
        upf_score += 1
        nutrition_warnings.append("고포화지방 식품")

    # 3. NOVA 그룹 판정
    nova_group = 1
    status_text = "자연/최소 가공식품"
    badge_color = "green"

    if len(detected_markers) >= 2 or upf_score >= 5:
        nova_group = 4
        status_text = "초가공식품 (UPF)"
        badge_color = "red"
    elif len(detected_markers) == 1 or upf_score >= 2:
        nova_group = 3
        status_text = "가공식품 (주의)"
        badge_color = "orange"
    elif SAFE_ADDITIVE_PATTERN.search(raw_materials) or calories > 0:
        nova_group = 2
        status_text = "가공 식재료"
        badge_color = "yellow"

    return {
        "novaGroup": nova_group,
        "statusText": status_text,
        "badgeColor": badge_color,
        "upfScore": upf_score,
        "detectedMarkers": detected_markers,
        "nutritionWarnings": nutrition_warnings,
        "isUPF": nova_group == 4,
    }