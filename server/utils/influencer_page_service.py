# utils/influencer_page_service.py
# /influencers 페이지용 인플루언서 목록·찜 토글·팬덤 점수.
from sqlalchemy.ext.asyncio import AsyncSession

from models.influencer_follow_model import InfluencerFollowModel
from models.influencer_recipe_model import InfluencerRecipeModel
from utils.recommendation_service import load_context, score_neighbor_items

INFLUENCER_ITEM_TYPE = "influencer"


async def list_influencers(session: AsyncSession, user_id: int | None) -> list[dict]:
    creators = await InfluencerRecipeModel.list_creators(session)
    if not creators:
        return []

    followed: set[str] = set()
    community: dict[str, float] = {}
    if user_id is not None:
        followed = await InfluencerFollowModel.list_followed(session, user_id)
        ctx = await load_context(session)
        neighbors = ctx.neighbors_of(user_id)
        if neighbors:
            scores = score_neighbor_items(ctx.affinity, neighbors, INFLUENCER_ITEM_TYPE, set())
            community = {key[1]: entry["score"] for key, entry in scores.items()}

    return [
        {
            "creatorId": row["creator_id"],
            "name": row["creator_name"],
            "recipeCount": int(row["recipe_count"]),
            "isFollowed": row["creator_id"] in followed,
            # 취향이 비슷한 유저들이 찜한 정도 (0이면 팬덤 추천 근거 없음)
            "communityScore": round(community.get(row["creator_id"], 0.0), 2),
        }
        for row in creators
    ]


async def follow_creator(session: AsyncSession, user_id: int, creator_id: str) -> bool:
    creators = {row["creator_id"]: row["creator_name"] for row in await InfluencerRecipeModel.list_creators(session)}
    if creator_id not in creators:
        return False  # 검수 레시피가 있는 크리에이터만 찜할 수 있다
    await InfluencerFollowModel.follow(session, user_id, creator_id, creators[creator_id])
    return True


async def unfollow_creator(session: AsyncSession, user_id: int, creator_id: str) -> None:
    await InfluencerFollowModel.unfollow(session, user_id, creator_id)
