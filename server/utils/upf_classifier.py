# utils/upf_classifier.py
import re

# 1. 무조건 NOVA 4(초가공식품) 지정 카테고리/제품명 키워드
ALWAYS_NOVA4_KEYWORDS = [
    "유탕면", "탄산음료", "빙과", "초콜릿가공품", "캔디류", 
    "피자", "냉동피자", "가공피자", "핫도그", "시리얼", "부대찌개"
]

# 2. 완제품 형태로 최소 NOVA 3(가공식품) 이상 보장 키워드
MIN_NOVA3_KEYWORDS = [
    "과자", "빵류", "혼합음료", "과.채음료", "즉석조리식품", "즉석섭취식품", 
    "만두", "어묵", "소스", "복합조미식품", "숙면", "액상차", "간편조리세트"
]

# 3. 오직 순수 '조리용 단순 재료'만 NOVA 2 허용
ONLY_NOVA2_TYPES = [
    "식용유지", "설탕류", "당류", "식염", "장류", "전분"
]

# 4. 공업용 첨가물 마커 (NOVA 4 시그니처)
UPF_MARKERS = {
    "MIXED_ADDITIVE": {
        "label": "식품첨가물 혼합제제",
        "weight": 3,
        "pattern": re.compile(r"식품첨가물혼합제제|혼합제제|첨가물제제", re.IGNORECASE),
    },
    "SWEETENER": {
        "label": "인공/대체 감미료",
        "weight": 3,
        "pattern": re.compile(
            r"수크랄로스|아스파탐|아세설팜칼륨|사카린나트륨|에리스리톨|말티톨|소르비톨|스테비올배당체|D-소비톨",
            re.IGNORECASE,
        ),
    },
    "INDUSTRIAL_FAT_EXTRACT": {
        "label": "산업용 유가공/변성전분/쇼트닝",
        "weight": 3,
        "pattern": re.compile(
            r"변성전분|초산전분|산화전분|가수분해단백질|단백가수분해물|말토덱스트린|고과당콘시럽|액상과당|기타과당|쇼트닝|마가린|식물성유지|팜유|팜올레인유",
            re.IGNORECASE,
        ),
    },
    "EMULSIFIER_STABILIZER": {
        "label": "유화제/산도조절제/증점안정제/소포제",
        "weight": 2,
        "pattern": re.compile(
            r"카라기난|잔탄검|구아검|폴리소르베이트|글리세린지방산에스테르|카르복시메틸셀룰로오스|산도조절제|유화제|증점제|스테아릴젖산나트륨|탄산수소나트륨|소포제",
            re.IGNORECASE,
        ),
    },
    "FLAVOR_ENHANCER": {
        "label": "향미증진제/가공육",
        "weight": 2,
        "pattern": re.compile(
            r"L-글루탐산나트륨|리보뉴클레오티드|이노신산|구아닐산|호박산이나트륨|향미증진제|시즈닝|소시지|프레스햄",
            re.IGNORECASE,
        ),
    },
    "COLORANT": {
        "label": "인공/합성 색소",
        "weight": 2,
        "pattern": re.compile(
            r"타르색소|적색\s*\d+호|황색\s*\d+호|청색\s*\d+호|카라멜색소|착색료",
            re.IGNORECASE,
        ),
    },
    "AROMA": {
        "label": "합성/일반 향료",
        "weight": 2,
        "pattern": re.compile(r"합성향료|바닐린|착향료|^향료$|,향료|천연향료|커피향|자몽향|오렌지향", re.IGNORECASE),
    },
}

def classify_food(food_data: dict) -> dict:
    product_type = str(food_data.get("product_type") or "").strip()
    product_name = str(food_data.get("product_name") or "").strip()
    raw_materials = str(food_data.get("raw_materials") or "").strip()

    sugars = float(food_data.get("sugars") or 0.0)
    sodium = float(food_data.get("sodium") or 0.0)
    saturated_fat = float(food_data.get("saturated_fat") or 0.0)

    # STEP 0: 절대적 카테고리/제품명 앵커 (NOVA 4 우선 확정)
    for k in ALWAYS_NOVA4_KEYWORDS:
        if k in product_type or k in product_name:
            return {
                "novaGroup": 4,
                "statusText": "초가공식품",
                "badgeColor": "#EF4444",
                "upfScore": 10,
                "detectedMarkers": ["카테고리/제품명 기반 초가공 식품 지정"],
                "nutritionWarnings": [],
                "isUPF": True,
            }

    # STEP 1: 원재료 첨가물 마커 스캔 & 스코어링
    detected_markers = []
    upf_score = 0
    for key, marker in UPF_MARKERS.items():
        if marker["pattern"].search(raw_materials):
            detected_markers.append(marker["label"])
            upf_score += marker["weight"]

    # STEP 2: 영양성분 프로파일 가산점
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

    # STEP 3: 최종 NOVA 등급 판정
    if len(detected_markers) >= 2 or upf_score >= 4:
        nova_group = 4
        status_text = "초가공식품"
        badge_color = "#EF4444"
    elif len(detected_markers) == 1 or upf_score >= 2:
        nova_group = 3
        status_text = "가공식품"
        badge_color = "#F97316"
    else:
        is_min_nova3 = any(k in product_type or k in product_name for k in MIN_NOVA3_KEYWORDS)
        is_pure_ingredient = any(t in product_type for t in ONLY_NOVA2_TYPES)

        # 정제수 외의 가공 요소(농축액, 비타민C, 구연산, 향료 등)가 들어간 주스는 최소 NOVA 3 지정
        is_processed_juice = "과.채주스" in product_type and any(
            x in raw_materials for x in ["농축", "비타민", "구연산", "정제수", "향"]
        )

        if is_min_nova3 or is_processed_juice:
            nova_group = 3
            status_text = "가공식품"
            badge_color = "#F97316"
        elif is_pure_ingredient:
            nova_group = 2
            status_text = "가공 식재료"
            badge_color = "#059669"
        else:
            nova_group = 1
            status_text = "자연/최소 가공"
            badge_color = "#34D399"

    return {
        "novaGroup": nova_group,
        "statusText": status_text,
        "badgeColor": badge_color,
        "upfScore": upf_score,
        "detectedMarkers": detected_markers,
        "nutritionWarnings": nutrition_warnings,
        "isUPF": nova_group == 4,
    }