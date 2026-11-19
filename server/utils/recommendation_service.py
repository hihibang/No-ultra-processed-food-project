# utils/recommendation_service.py
"""행동 로그 기반 협업 필터링(CF) 추천 엔진.

- 행동 가중치: view 1 / click·compare 2 / wish·save 5. 최근 행동일수록 가중치가 크다 (반감기 30일 시간 감쇠).
- 같은 (사용자, 항목) 쌍은 여러 기록이 있어도 최댓값 하나만 쓴다 (찜 테이블과 행동 로그에 중복 기록돼도 두 번 세지 않음).
- 사용자 벡터 = 항목별 행동 점수 + 주방도구·선호 요리 프로필 토큰 → 코사인 유사도로 이웃(Top-K) 탐색.
- 데이터가 부족하면(Cold Start) 콘텐츠 점수(건강 점수)나 인기 순위로 자연스럽게 Fallback 한다.

순수 함수(계산)와 DB 조합(load_context 등 async 함수)을 나눠 두어 계산 로직만 따로 테스트할 수 있게 했다.
"""
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Iterable, Optional

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.ext.asyncio import AsyncSession

from models.interaction_model import InteractionModel
from models.recommendation_model import RecommendationCatalogModel
from utils.comparison_report import build_comparison_item

ACTION_WEIGHTS = {"view": 1.0, "click": 2.0, "compare": 2.0, "wish": 5.0, "save": 5.0}
WISH_ACTIONS = frozenset({"wish", "save"})
ENGAGE_ACTIONS = frozenset({"wish", "save", "compare", "click"})
HALF_LIFE_DAYS = 30.0
TOP_K_NEIGHBORS = 5
PROFILE_WEIGHT = 1.0
PROFILE_TYPE = "profile"

RECIPE_PICK_LIMIT = 6
PRODUCT_PICK_LIMIT = 3  # 레시피 → 상품 추천은 상위 3개만 노출
CROSS_PICK_LIMIT = 4
COMPARE_PICK_LIMIT = 3
CANDIDATE_LIMIT = 200
KEYWORD_LIMIT = 10

INGREDIENT_STOPWORDS = {
    "재료", "재료준비", "준비물", "필요한도구", "조리순서", "조리방법", "팁", "영양정보",
    "적당량", "약간", "조금", "기호에", "기호에맞게", "선택", "취향", "시간", "분", "개",
    # 답변 문장에서 재료가 아닌 단어 (일반 안내 문장 대비)
    "만들기", "위해서는", "위해", "일반적으로", "일반적", "보통", "정도", "요리", "레시피",
    "방법", "추천", "필요", "준비", "사용", "넣고", "넣어", "다음", "함께", "먼저", "있는", "하는",
    "위해서", "만들려면",
    # 조리법 단어는 재료가 아니다 ("불닭볶음소스"가 '볶음'으로 걸리지 않도록)
    "볶음", "조림", "구이", "튀김", "무침", "찜", "부침",
}
# 조리 순서·팁처럼 재료가 아닌 섹션 제목 (재료가 없을 때 본문 문장을 읽을 때 건너뛴다)
NON_INGREDIENT_HEADING_WORDS = ("조리", "순서", "방법", "팁", "영양")
# 레시피 재료로 쓸 수 있는 상품 유형 (원물·조미료·소스·오일·향신료). 여기 없는 유형은 전부 제외한다.
INGREDIENT_PRODUCT_TYPES = (
    # 원물·조미료·소스·오일·향신료
    "소스", "복합조미식품", "조미료", "양념", "향신료", "식용유지", "식용유지류",
    "농산물", "채소류", "과실류", "곡류", "축산물", "육류", "수산물", "어패류", "해조류",
    # 요리의 주재료·부재료로 쓰이는 가공 식재료
    "어묵", "어육가공품", "두부", "묵", "면류", "햄", "소시지", "베이컨", "식육가공품",
    "식육함유가공품", "수산물가공품", "통조림", "김치", "절임식품", "치즈", "버터", "유가공품",
    "건어물", "떡류",
)
# 가공 완제품(음료·간식·디저트 등)을 상품명 끝 글자로 걸러낸다 ("계란과자", "과일주스", "옥수수빵" ...)
EXCLUDED_NAME_SUFFIXES = (
    "주스", "쥬스", "음료", "스무디", "케이크", "과자", "스낵", "빵", "아이스크림",
    "밀키트", "쿠키", "사탕", "초콜릿", "젤리", "캔디", "티", "녹차", "홍차", "보리차", "율무차", "유자차",
)
EXCLUDED_NAME_TOKENS = frozenset({"차", "완제품", "밀키트", "아이스크림"})
# 상품명 뒤에 붙는 범용 분류어. 떼어내고 나머지로 재료 키워드를 맞춘다 ("슴슴국간장소스" → "슴슴국간장")
GENERIC_NAME_SUFFIXES = ("소스", "양념장", "양념", "드레싱", "시즈닝")
# 조사는 키워드 끝에서 떼어낸다 ("어묵탕을" → "어묵탕", "두부가" → "두부")
PARTICLE_SUFFIXES = ("으로", "에서", "까지", "부터", "에는", "이나", "을", "를", "은", "는", "이", "가", "에", "의", "와", "과", "로", "도")
# 매칭 점수 = 상품명 일치(0.7) + 원재료 일치(0.3). 임계값 미만이면 추천하지 않는다.
NAME_MATCH_WEIGHT = 0.7
RAW_MATCH_WEIGHT = 0.3
MATCH_THRESHOLD = 0.6

UNIT_PATTERN = re.compile(r"\d+(\.\d+)?\s*(g|kg|ml|l|개|큰술|작은술|스푼|컵|T|t|cm|장|쪽|줌|꼬집)?", re.IGNORECASE)

ItemKey = tuple  # (item_type, item_id)


# ---------------------------------------------------------------------------
# 순수 계산 함수
# ---------------------------------------------------------------------------

def action_weight(action: str) -> float:
    return ACTION_WEIGHTS.get(action, 0.0)


def _naive(dt: Optional[datetime]) -> Optional[datetime]:
    # MySQL TIMESTAMP는 naive datetime으로 돌아오므로 시간대 정보를 제거해 통일한다
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone().replace(tzinfo=None)
    return dt


def time_decay(created_at: Optional[datetime], now: datetime) -> float:
    created = _naive(created_at)
    if created is None:
        return 1.0
    age_days = max(0.0, (now - created).total_seconds() / 86400.0)
    return 0.5 ** (age_days / HALF_LIFE_DAYS)


def recipe_key(title: str | None) -> str:
    # 레시피 식별자: 공백을 없애고 소문자로 맞춘 제목 (레시피 테이블 PK가 없으므로 제목으로 대신한다)
    return re.sub(r"\s+", "", str(title or "")).lower()


def extract_keywords(recipe_title: str, ingredients, limit: int = KEYWORD_LIMIT) -> list[str]:
    """레시피 제목과 재료(목록 또는 마크다운 텍스트)에서 상품 검색 키워드를 뽑는다."""
    raw_parts: list[str] = []
    if isinstance(ingredients, str):
        raw_parts.extend(_ingredient_lines(ingredients))
    elif ingredients:
        raw_parts.extend(str(item) for item in ingredients)
    raw_parts.append(recipe_title or "")

    keywords: list[str] = []
    for part in raw_parts:
        cleaned = re.sub(r"\([^)]*\)|\[[^\]]*\]", " ", part)
        cleaned = UNIT_PATTERN.sub(" ", cleaned)
        for raw_token in re.findall(r"[가-힣A-Za-z]{2,}", cleaned):
            token = _strip_particle(raw_token)
            if token in INGREDIENT_STOPWORDS or token.lower() in INGREDIENT_STOPWORDS:
                continue
            if token not in keywords:
                keywords.append(token)
            if len(keywords) >= limit:
                return keywords
    return keywords


def _ingredient_lines(text: str) -> list[str]:
    # "재료" 제목 아래의 목록 줄만 고른다. 제목이 없으면 글머리표 줄 전체를 쓴다.
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    section: list[str] = []
    inside = False
    for line in lines:
        is_heading = line.startswith("#")
        if is_heading and "재료" in line and not inside:
            inside = True
            continue
        if inside and is_heading:
            break
        if inside:
            section.append(re.sub(r"^[-*\d.)\s]+", "", line))
    if section:
        return section
    bullets = [re.sub(r"^[-*\s]+", "", line) for line in lines if line.startswith(("-", "*"))]
    if bullets:
        return bullets
    # 재료 목록이 없는 일반 안내 문장("어묵탕을 만들려면 어묵, 대파, 국간장...")은 조리 섹션을 뺀 본문 전체를 읽는다
    prose: list[str] = []
    skipping = False
    for line in lines:
        if line.startswith("#"):
            skipping = any(word in line for word in NON_INGREDIENT_HEADING_WORDS)
            continue
        if not skipping:
            prose.append(line)
    return prose


def _strip_particle(token: str) -> str:
    for particle in PARTICLE_SUFFIXES:
        if token.endswith(particle) and len(token) - len(particle) >= 2:
            return token[: -len(particle)]
    return token


def build_events(
    wishlists: Iterable[dict],
    comparisons: Iterable[dict],
    recipe_logs: Iterable[dict],
    interactions: Iterable[dict],
) -> tuple[list[dict], dict[str, str], dict[str, str]]:
    """여러 원천 테이블을 공통 행동 이벤트 목록으로 바꾼다. 레시피 제목과 본문도 함께 모은다."""
    events: list[dict] = []
    titles: dict[str, str] = {}
    bodies: dict[str, tuple[datetime | None, str]] = {}

    for row in wishlists:
        events.append({"user_id": row["user_id"], "item_type": "product", "item_id": str(row["food_id"]),
                       "action": "wish", "created_at": row["created_at"]})

    for row in comparisons:
        for pid in row["product_ids"]:
            events.append({"user_id": row["user_id"], "item_type": "product", "item_id": str(pid),
                           "action": "compare", "created_at": row["created_at"]})

    for row in recipe_logs:
        key = recipe_key(row["title"])
        if not key:
            continue
        titles.setdefault(key, row["title"])
        if row.get("markdown"):
            previous = bodies.get(key)
            if previous is None or (_naive(row["created_at"]) or datetime.min) >= (_naive(previous[0]) or datetime.min):
                bodies[key] = (row["created_at"], row["markdown"])
        events.append({"user_id": row["user_id"], "item_type": "recipe", "item_id": key,
                       "action": "save", "created_at": row["created_at"]})

    for row in interactions:
        item_id = str(row["item_id"])
        if row["item_type"] == "recipe" and row.get("label"):
            titles.setdefault(item_id, row["label"])
        events.append({"user_id": row["user_id"], "item_type": row["item_type"], "item_id": item_id,
                       "action": row["action"], "created_at": row["created_at"]})

    return events, titles, {key: body for key, (_, body) in bodies.items()}


def build_affinity(events: Iterable[dict], now: datetime):
    """사용자별 항목 점수(affinity), 찜 목록(wished), 관심 표현 목록(engaged)을 만든다."""
    affinity: dict[int, dict[ItemKey, float]] = {}
    wished: dict[int, set[ItemKey]] = {}
    engaged: dict[int, set[ItemKey]] = {}

    for event in events:
        action = event["action"]
        weight = action_weight(action) * time_decay(event.get("created_at"), now)
        if weight <= 0:
            continue
        key = (event["item_type"], str(event["item_id"]))
        user_id = event["user_id"]
        bucket = affinity.setdefault(user_id, {})
        bucket[key] = max(bucket.get(key, 0.0), weight)
        if action in WISH_ACTIONS:
            wished.setdefault(user_id, set()).add(key)
        if action in ENGAGE_ACTIONS:
            engaged.setdefault(user_id, set()).add(key)

    return affinity, wished, engaged


def build_user_matrix(affinity: dict, profiles: Iterable[dict]):
    """사용자 × 특징 행렬. 특징은 항목 행동 점수와 프로필 토큰(주방도구, 선호 요리)이다."""
    profile_map = {row["user_id"]: row for row in profiles}
    user_ids = sorted(set(affinity) | set(profile_map))
    vectors: dict[int, dict[ItemKey, float]] = {uid: dict(affinity.get(uid, {})) for uid in user_ids}

    for uid in user_ids:
        profile = profile_map.get(uid, {})
        for appliance in profile.get("appliances", []):
            vectors[uid][(PROFILE_TYPE, f"app:{appliance}")] = PROFILE_WEIGHT
        for preference in profile.get("preferences", []):
            vectors[uid][(PROFILE_TYPE, f"pref:{preference}")] = PROFILE_WEIGHT

    feature_keys = sorted({key for vector in vectors.values() for key in vector}, key=str)
    index = {key: i for i, key in enumerate(feature_keys)}
    matrix = np.zeros((len(user_ids), len(feature_keys)), dtype=float)
    for row, uid in enumerate(user_ids):
        for key, value in vectors[uid].items():
            matrix[row, index[key]] = value
    return user_ids, matrix


def find_neighbors(user_ids: list[int], matrix: np.ndarray, target_id: int | None, top_k: int = TOP_K_NEIGHBORS):
    """코사인 유사도 기준 이웃 (본인 제외, 유사도 0 초과만). 없으면 빈 목록."""
    if target_id is None or target_id not in user_ids or matrix.shape[1] == 0:
        return []
    row = user_ids.index(target_id)
    sims = cosine_similarity(matrix[row:row + 1], matrix)[0]
    pairs = [(uid, float(sim)) for uid, sim in zip(user_ids, sims) if uid != target_id and sim > 0]
    pairs.sort(key=lambda pair: pair[1], reverse=True)
    return pairs[:top_k]


def score_neighbor_items(affinity: dict, neighbors: list, item_type: str, exclude: set) -> dict:
    """이웃들이 가진 항목 점수 = Σ(유사도 × 행동 점수). 항목별 최고 유사도와 지지 인원도 함께 센다."""
    scores: dict[ItemKey, dict] = {}
    for uid, sim in neighbors:
        for key, weight in affinity.get(uid, {}).items():
            if key[0] != item_type or key in exclude:
                continue
            entry = scores.setdefault(key, {"score": 0.0, "bestSim": 0.0, "supporters": 0})
            entry["score"] += sim * weight
            entry["bestSim"] = max(entry["bestSim"], sim)
            entry["supporters"] += 1
    return scores


def popularity(affinity: dict, item_type: str, exclude: set) -> dict:
    """전체 사용자 기준 인기 점수 (Cold Start Fallback)."""
    scores: dict[ItemKey, dict] = {}
    for user_items in affinity.values():
        for key, weight in user_items.items():
            if key[0] != item_type or key in exclude:
                continue
            entry = scores.setdefault(key, {"score": 0.0, "bestSim": 0.0, "supporters": 0})
            entry["score"] += weight
            entry["supporters"] += 1
    return scores


def rank_scores(scores: dict) -> list[tuple[ItemKey, dict]]:
    return sorted(scores.items(), key=lambda kv: (-kv[1]["score"], -kv[1]["supporters"], kv[0][1]))


def rank_cross_domain(target_key: ItemKey, affinity: dict, wished: dict, item_type: str, limit: int) -> list[tuple[ItemKey, int]]:
    """팬(target을 찜한 사용자)들이 함께 찜한 항목을 '함께 찜한 인원 수' 기준으로 고른다."""
    fans = [uid for uid, keys in wished.items() if target_key in keys]
    counts: dict[ItemKey, int] = {}
    totals: dict[ItemKey, float] = {}
    for uid in fans:
        for key, weight in affinity.get(uid, {}).items():
            if key == target_key or key[0] != item_type:
                continue
            totals[key] = totals.get(key, 0.0) + weight
            if key in wished.get(uid, set()):
                counts[key] = counts.get(key, 0) + 1
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], -totals.get(kv[0], 0.0), kv[0][1]))
    return ranked[:limit]


def fan_count(wished: dict, target_key: ItemKey) -> int:
    return sum(1 for keys in wished.values() if target_key in keys)


def popular_wished(wished: dict, item_type: str, exclude: set, limit: int) -> list[tuple[ItemKey, int]]:
    counts: dict[ItemKey, int] = {}
    for keys in wished.values():
        for key in keys:
            if key[0] == item_type and key not in exclude:
                counts[key] = counts.get(key, 0) + 1
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0][1]))[:limit]


def selection_summary(base_key: ItemKey, wished: dict, engaged: dict) -> tuple[int, dict[ItemKey, float]]:
    """기준 상품을 찜한 고객(없으면 찜·비교한 고객)이 다른 상품을 찜한 비율."""
    base_users = [uid for uid, keys in wished.items() if base_key in keys]
    if not base_users:
        base_users = [uid for uid, keys in engaged.items() if base_key in keys]
    n = len(base_users)
    if n == 0:
        return 0, {}

    counts: dict[ItemKey, int] = {}
    for uid in base_users:
        for key in wished.get(uid, set()):
            if key[0] == "product" and key != base_key:
                counts[key] = counts.get(key, 0) + 1
    return n, {key: count / n for key, count in counts.items()}


def pick_closest_health(base_item: dict, candidates: list[dict], limit: int) -> list[dict]:
    """건강 점수가 가장 비슷한 동종 상품 (기준 상품과 같은 상품은 제외)."""
    others = [c for c in candidates if c["reportNo"] != base_item["reportNo"]]
    others.sort(key=lambda c: (abs(c["healthScore"] - base_item["healthScore"]),
                               abs(c["nutrition"]["calories"] - base_item["nutrition"]["calories"])))
    return others[:limit]


def _badge_list(*labels: Optional[str]) -> list[str]:
    return [label for label in labels if label]


# ---------------------------------------------------------------------------
# DB를 읽어 추천 입력을 만드는 비동기 함수
# ---------------------------------------------------------------------------

@dataclass
class RecommendationContext:
    now: datetime
    affinity: dict
    wished: dict
    engaged: dict
    titles: dict
    bodies: dict
    user_ids: list = field(default_factory=list)
    matrix: np.ndarray = field(default_factory=lambda: np.zeros((0, 0)))

    def neighbors_of(self, user_id: int | None) -> list:
        return find_neighbors(self.user_ids, self.matrix, user_id)


async def load_context(session: AsyncSession, now: datetime | None = None) -> RecommendationContext:
    now = _naive(now) or datetime.now()
    events, titles, bodies = build_events(
        await InteractionModel.list_wishlists(session),
        await InteractionModel.list_comparisons(session),
        await InteractionModel.list_recipe_logs(session),
        await InteractionModel.list_interactions(session),
    )
    affinity, wished, engaged = build_affinity(events, now)
    user_ids, matrix = build_user_matrix(affinity, await InteractionModel.list_profiles(session))
    return RecommendationContext(
        now=now, affinity=affinity, wished=wished, engaged=engaged,
        titles=titles, bodies=bodies, user_ids=user_ids, matrix=matrix,
    )


async def record_interaction(
    session: AsyncSession,
    user_id: int,
    item_type: str,
    item_id: str,
    action: str,
    label: str | None,
) -> dict:
    weight = action_weight(action)
    row_id = await InteractionModel.insert(session, user_id, item_type, item_id, action, weight, label)
    return {"id": row_id, "item_type": item_type, "item_id": item_id, "action": action, "weight": weight}


async def similar_user_recipes(session: AsyncSession, user_id: int, limit: int = RECIPE_PICK_LIMIT) -> dict:
    ctx = await load_context(session)
    neighbors = ctx.neighbors_of(user_id)
    seen = set(ctx.affinity.get(user_id, {}).keys())

    scores = score_neighbor_items(ctx.affinity, neighbors, "recipe", seen) if neighbors else {}
    if scores:
        strategy, ranked = "collaborative", rank_scores(scores)[:limit]
    else:
        strategy, ranked = "popular", rank_scores(popularity(ctx.affinity, "recipe", seen))[:limit]

    items = []
    for (_, key), entry in ranked:
        match_rate = round(entry["bestSim"] * 100) if strategy == "collaborative" else None
        if strategy == "collaborative":
            reason = f"취향 일치율 {match_rate}% · 비슷한 유저 {entry['supporters']}명이 저장"
            badges = ["👥 비슷한 취향 저장"]
        else:
            reason = f"{entry['supporters']}명이 저장한 인기 레시피"
            badges = ["🔥 인기 레시피"]
        items.append({
            "key": key,
            "title": ctx.titles.get(key, key),
            "markdown": ctx.bodies.get(key),
            "matchRate": match_rate,
            "supporters": entry["supporters"],
            "reason": reason,
            "badges": badges,
        })
    return {"strategy": strategy, "items": items}


def is_ingredient_product(row: dict) -> bool:
    """원물·조미료·소스·오일·향신료인지 판정한다. 가공 완제품(주스·과자·케이크 등)은 False."""
    if (row.get("product_type") or "") not in INGREDIENT_PRODUCT_TYPES:
        return False
    for token in re.findall(r"[가-힣A-Za-z0-9]+", row.get("product_name") or ""):
        if token in EXCLUDED_NAME_TOKENS or token.endswith(EXCLUDED_NAME_SUFFIXES):
            return False
    return True


def match_score(keyword: str, product_name: str | None, raw_materials: str | None) -> float:
    """키워드 하나와 상품의 적합도 (0~1).

    상품명: 토큰 전체 일치 1.0, 앞·뒤 합성어(양조간장 ∋ 간장) 0.9, 중간 포함(순두부찌개양념 ∋ 두부) 0.6
    원재료: 토큰 전체 일치 1.0, 부분 포함 0.5
    """
    kw = keyword.lower()
    name_tokens = []
    for raw in re.findall(r"[가-힣A-Za-z0-9]+", product_name or ""):
        token = raw.lower()
        name_tokens.append(token)
        for suffix in GENERIC_NAME_SUFFIXES:
            if token.endswith(suffix) and len(token) - len(suffix) >= 2:
                name_tokens.append(token[: -len(suffix)])  # 분류어를 뗀 핵심 토큰 (슴슴국간장소스 → 슴슴국간장)
                break
    if kw in name_tokens:
        name = 1.0
    elif any(t.startswith(kw) or t.endswith(kw) for t in name_tokens):
        name = 0.9
    elif any(kw in t for t in name_tokens):
        name = 0.6
    else:
        name = 0.0

    raw_tokens = [t.lower() for t in re.split(r"[,\s()/\[\]]+", raw_materials or "") if t]
    if kw in raw_tokens:
        raw = 1.0
    elif any(kw in t for t in raw_tokens):
        raw = 0.5
    else:
        raw = 0.0
    return NAME_MATCH_WEIGHT * name + RAW_MATCH_WEIGHT * raw


def select_ingredient_matches(rows: list[dict], keywords: list[str], threshold: float = MATCH_THRESHOLD) -> list[tuple[dict, float]]:
    """재료 상품만 남기고, 키워드 매칭 점수가 임계값 이상인 행만 (행, 점수) 목록으로 돌려준다."""
    matched = []
    for row in rows:
        if not is_ingredient_product(row):
            continue
        score = max((match_score(kw, row.get("product_name"), row.get("raw_materials")) for kw in keywords), default=0.0)
        if score >= threshold:
            matched.append((row, score))
    return matched


def rank_product_candidates(candidates: list[dict], wished_keys: set, cf_scores: dict, limit: int) -> list[dict]:
    """정렬 우선순위: 내가 찜한 상품 → 유사 취향 점수(CF) → 건강 점수."""
    ranked = []
    for item in candidates:
        key = ("product", item["reportNo"])
        is_wished = key in wished_keys
        cf_score = cf_scores.get(key, {}).get("score", 0.0)
        ranked.append((
            (not is_wished, -cf_score, -item["healthScore"], item["reportNo"]),
            {
                **item,
                "isWished": is_wished,
                "cfScore": round(cf_score, 2),
                "badges": _badge_list(
                    "❤️ 내가 찜한 식재료" if is_wished else None,
                    "👥 유사 취향 Pick" if cf_score > 0 else None,
                ),
            },
        ))
    ranked.sort(key=lambda pair: pair[0])
    return [item for _, item in ranked[:limit]]


async def recipe_products(
    session: AsyncSession,
    user_id: int | None,
    recipe_title: str,
    ingredients,
    limit: int = PRODUCT_PICK_LIMIT,
) -> dict:
    keywords = extract_keywords(recipe_title, ingredients)
    if not keywords:
        return {"strategy": "none", "items": []}

    rows = await RecommendationCatalogModel.search_by_keywords(
        session, keywords, CANDIDATE_LIMIT, INGREDIENT_PRODUCT_TYPES,
    )
    matched = select_ingredient_matches(rows, keywords)
    if not matched:
        # 재료에 맞는 상품이 없으면 억지로 채우지 않는다 (프론트는 빈 배열이면 섹션을 숨긴다)
        return {"strategy": "none", "items": []}
    candidates = [build_comparison_item(row) for row, _ in matched]

    ctx = await load_context(session)
    neighbors = ctx.neighbors_of(user_id)
    cf_scores = score_neighbor_items(ctx.affinity, neighbors, "product", set()) if neighbors else {}
    wished_keys = ctx.wished.get(user_id, set()) if user_id is not None else set()
    picked = rank_product_candidates(candidates, wished_keys, cf_scores, limit)

    strategy = "collaborative" if any(item["cfScore"] > 0 for item in picked) else "content"
    return {"strategy": strategy, "items": picked}


async def cross_domain(session: AsyncSession, target_type: str, target_id: str) -> dict:
    ctx = await load_context(session)
    target_key = (target_type, str(target_id))
    fans = fan_count(ctx.wished, target_key)

    if fans:
        strategy = "fan_cf"
        picked_products = rank_cross_domain(target_key, ctx.affinity, ctx.wished, "product", CROSS_PICK_LIMIT)
        picked_recipes = rank_cross_domain(target_key, ctx.affinity, ctx.wished, "recipe", CROSS_PICK_LIMIT)
    else:
        strategy = "popular"
        exclude = {target_key}
        picked_products = popular_wished(ctx.wished, "product", exclude, CROSS_PICK_LIMIT)
        picked_recipes = popular_wished(ctx.wished, "recipe", exclude, CROSS_PICK_LIMIT)

    product_rows = await RecommendationCatalogModel.find_by_ids(session, [key[1] for key, _ in picked_products])
    product_items = {str(row["report_no"]): build_comparison_item(row) for row in product_rows}
    products = []
    for key, count in picked_products:
        item = product_items.get(key[1])
        if item is None:  # 카탈로그에서 빠진 상품은 제외
            continue
        products.append({
            "reportNo": item["reportNo"],
            "productName": item["productName"],
            "companyName": item["companyName"],
            "imageUrl": item["imageUrl"],
            "novaGroup": item["novaGroup"],
            "healthScore": item["healthScore"],
            "fanWishCount": count,
        })

    recipes = [
        {
            "key": key[1],
            "title": ctx.titles.get(key[1], key[1]),
            "markdown": ctx.bodies.get(key[1]),
            "fanWishCount": count,
        }
        for key, count in picked_recipes
    ]
    return {"strategy": strategy, "fanCount": fans, "products": products, "recipes": recipes}


async def compare_product(session: AsyncSession, product_id: str) -> dict | None:
    base_row = await RecommendationCatalogModel.find_by_id(session, product_id)
    if base_row is None:
        return None

    base = build_comparison_item(base_row)
    ctx = await load_context(session)
    base_key = ("product", product_id)
    sample_size, rates = selection_summary(base_key, ctx.wished, ctx.engaged)

    near_rows = await RecommendationCatalogModel.find_same_type_near(
        session, base_row["product_type"], float(base_row["calories"] or 0.0), product_id, CANDIDATE_LIMIT,
    )
    alternatives = pick_closest_health(base, [build_comparison_item(r) for r in near_rows], COMPARE_PICK_LIMIT)

    # 선택 비율이 높은 상품도 함께 보여준다 (동종이 아니어도 실제 고객 선택 기준)
    top_keys = sorted(rates, key=lambda k: (-rates[k], k[1]))[:COMPARE_PICK_LIMIT]
    top_rows = await RecommendationCatalogModel.find_by_ids(session, [k[1] for k in top_keys])
    top_selected = [build_comparison_item(r) for r in top_rows]

    def _with_selection(item: dict) -> dict:
        rate = rates.get(("product", item["reportNo"]))
        return {
            **_strip_score_fields(item),
            "healthDiff": item["healthScore"] - base["healthScore"],
            "selectionRate": round(rate * 100) if (sample_size and rate is not None) else (0 if sample_size else None),
        }

    alt_payload = [_with_selection(item) for item in alternatives]
    top_payload = [_with_selection(item) for item in top_selected if item["reportNo"] != product_id]

    best = max(
        (item for item in alt_payload + top_payload if item["selectionRate"]),
        key=lambda item: item["selectionRate"],
        default=None,
    )
    headline = (
        f"이 상품을 찜한 고객의 {best['selectionRate']}%가 선택한 상품: {best['productName']}"
        if best else None
    )
    return {
        "baseProduct": _strip_score_fields(base),
        "sampleSize": sample_size,
        "headline": headline,
        "alternatives": alt_payload,
        "topSelected": top_payload,
    }


def _strip_score_fields(item: dict) -> dict:
    return {
        "reportNo": item["reportNo"],
        "productName": item["productName"],
        "companyName": item["companyName"],
        "imageUrl": item["imageUrl"],
        "novaGroup": item["novaGroup"],
        "statusText": item["statusText"],
        "healthScore": item["healthScore"],
        "nutrition": item["nutrition"],
    }
