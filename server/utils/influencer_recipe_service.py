# utils/influencer_recipe_service.py
# 챗봇 레시피 답변 옆에 보여줄 인플루언서 레시피 후보 (1~2개).
#  1) 내가 찜한 크리에이터의 검수 레시피 → source "followed_influencer"
#  2) 부족하면 취향이 비슷한 유저들이 선호하는 크리에이터의 검수 레시피 → source "similar_user_influencer"
# 후보 풀은 검수 레시피 테이블뿐이라 일반 유저의 커스텀/저장 레시피는 들어가지 않는다.
from typing import Iterable

from sqlalchemy.ext.asyncio import AsyncSession

from models.influencer_recipe_model import InfluencerRecipeModel
from utils.recommendation_service import load_context, score_neighbor_items

INFLUENCER_PICK_LIMIT = 2
INFLUENCER_ITEM_TYPE = "influencer"

SOURCE_FOLLOWED = "followed_influencer"
SOURCE_SIMILAR = "similar_user_influencer"
BADGES = {
    SOURCE_FOLLOWED: "내가 찜한 크리에이터 레시피",
    SOURCE_SIMILAR: "유사 취향 유저 픽 인플루언서 레시피",
}


def pick_influencer_recipes(
    recipes: Iterable[dict],
    followed_creator_ids: set[str],
    creator_scores: dict[str, float],
    limit: int = INFLUENCER_PICK_LIMIT,
) -> list[dict]:
    """검수 레시피 목록에서 후보를 고른다. recipes는 최신순으로 정렬돼 있다고 가정한다."""
    recipes = list(recipes)
    picked: list[dict] = []

    def add(recipe: dict, source: str) -> None:
        picked.append({
            "recipeId": int(recipe["recipe_id"]),
            "title": recipe["recipe_title"],
            "creatorId": recipe["creator_id"],
            "creatorName": recipe["creator_name"],
            "source": source,
            "badge": BADGES[source],
        })

    # 1) 찜한 크리에이터의 레시피 먼저
    for recipe in recipes:
        if len(picked) >= limit:
            return picked
        if recipe["creator_id"] in followed_creator_ids:
            add(recipe, SOURCE_FOLLOWED)

    # 2) 부족하면 유사 취향 유저가 선호하는 크리에이터(점수순)의 레시피
    ranked_creators = sorted(
        (cid for cid in creator_scores if cid not in followed_creator_ids),
        key=lambda cid: (-creator_scores[cid], cid),
    )
    for creator_id in ranked_creators:
        for recipe in recipes:
            if len(picked) >= limit:
                return picked
            if recipe["creator_id"] == creator_id:
                add(recipe, SOURCE_SIMILAR)
                break  # 크리에이터당 1개만 (한 사람 레시피로 채우지 않도록)
    return picked


async def influencer_recipe_candidates(
    session: AsyncSession,
    user_id: int | None,
    limit: int = INFLUENCER_PICK_LIMIT,
) -> list[dict]:
    if user_id is None:
        return []  # 비로그인은 찜·취향 데이터가 없어 개인화 후보를 만들 수 없다

    recipes = await InfluencerRecipeModel.list_verified(session)
    if not recipes:
        return []

    ctx = await load_context(session)
    followed = {key[1] for key in ctx.wished.get(user_id, set()) if key[0] == INFLUENCER_ITEM_TYPE}
    neighbors = ctx.neighbors_of(user_id)
    scores = score_neighbor_items(ctx.affinity, neighbors, INFLUENCER_ITEM_TYPE, set()) if neighbors else {}
    creator_scores = {key[1]: entry["score"] for key, entry in scores.items()}
    return pick_influencer_recipes(recipes, followed, creator_scores, limit)
