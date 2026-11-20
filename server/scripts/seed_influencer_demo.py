# scripts/seed_influencer_demo.py
# 시연용 AI 인플루언서 3명 + 검수 레시피 6개 + 팬 데모 유저(찜·저장 기록) 생성/삭제. 실행 전 개발 DB인지 확인하세요.
#   생성:      cd server && .venv/bin/python -m scripts.seed_influencer_demo
#   매칭 확인: cd server && .venv/bin/python -m scripts.seed_influencer_demo --check
#   삭제:      cd server && .venv/bin/python -m scripts.seed_influencer_demo --cleanup
# 팬 유저는 이메일이 demo-rec-fan-*@example.test 인 계정만 만들고, 삭제 시 이 계정과 시드 인플루언서 데이터만 지운다.
# 여러 번 실행해도 같은 결과가 된다(재실행 안전).
import asyncio
import json
import sys

from sqlalchemy import text

from database import AsyncSessionLocal, engine
from models.user_model import UserModel
from scripts.influencer_seed_data import INFLUENCERS
from utils import recommendation_service as recommend

FAN_EMAIL_PATTERN = "demo-rec-fan-%@example.test"
FAN_PASSWORD = "demo-only-password"
CREATOR_IDS = [inf["creator_id"] for inf in INFLUENCERS]

# 팬 유저: 실제 가입 화면과 같은 한글 옵션 값을 써야 실사용자와 취향 유사도가 계산된다.
# follows: 찜한 인플루언서 / products: 찜한 상품(report_no, 레시피 재료로 매칭되는 실제 상품) / saved: 보관한 인플루언서 레시피 제목
FANS = [
    {"email": "demo-rec-fan-1@example.test", "name": "팬덤 데모1", "appliances": ["전자레인지", "인덕션"], "preferences": ["한식", "건강식"],
     "follows": ["creator-minji", "creator-haeun"], "products": ["19880311002355", "2002046408832"],
     "saved": ["5분 어묵 간장볶음", "소고기 두부 굴소스볶음"]},
    {"email": "demo-rec-fan-2@example.test", "name": "팬덤 데모2", "appliances": ["가스레인지", "믹서기"], "preferences": ["한식", "건강식"],
     "follows": ["creator-seojun", "creator-minji"], "products": ["20010306244646", "19880311002355"],
     "saved": ["국간장 달걀찜", "5분 어묵 간장볶음"]},
    {"email": "demo-rec-fan-3@example.test", "name": "팬덤 데모3", "appliances": ["에어프라이어", "오븐"], "preferences": ["건강식", "양식"],
     "follows": ["creator-haeun", "creator-seojun"], "products": ["200204610734260", "20010306244646"],
     "saved": ["참치 달걀 단백질 덮밥", "두부 브로콜리 간장구이"]},
    {"email": "demo-rec-fan-4@example.test", "name": "팬덤 데모4", "appliances": ["인덕션", "에어프라이어"], "preferences": ["한식"],
     "follows": ["creator-minji", "creator-seojun"], "products": ["2002046408832", "20010306244646"],
     "saved": ["굴소스 오징어 양배추볶음", "국간장 달걀찜"]},
]

PROFILE_DDL = """
CREATE TABLE IF NOT EXISTS influencer_profiles (
    creator_id VARCHAR(64) PRIMARY KEY,
    avatar VARCHAR(16) NULL,
    concept VARCHAR(100) NOT NULL,
    bio VARCHAR(300) NULL,
    tags JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


def recipe_body(title: str) -> str:
    for inf in INFLUENCERS:
        for recipe in inf["recipes"]:
            if recipe["title"] == title:
                return recipe["markdown"]
    raise KeyError(title)


async def seed_creators(session) -> None:
    await session.execute(text(PROFILE_DDL))
    for inf in INFLUENCERS:
        await session.execute(text("""
            INSERT INTO influencer_profiles (creator_id, avatar, concept, bio, tags)
            VALUES (:cid, :avatar, :concept, :bio, :tags)
            ON DUPLICATE KEY UPDATE avatar = VALUES(avatar), concept = VALUES(concept), bio = VALUES(bio), tags = VALUES(tags)
        """), {"cid": inf["creator_id"], "avatar": inf["avatar"], "concept": inf["concept"], "bio": inf["bio"],
               "tags": json.dumps(inf["tags"], ensure_ascii=False)})
        for recipe in inf["recipes"]:
            existing = (await session.execute(text(
                "SELECT recipe_id FROM influencer_recipes WHERE creator_id = :cid AND recipe_title = :title"),
                {"cid": inf["creator_id"], "title": recipe["title"]})).first()
            params = {"cid": inf["creator_id"], "name": inf["name"], "title": recipe["title"], "md": recipe["markdown"]}
            if existing:  # 재실행 시 recipe_id 를 유지하고 내용만 갱신
                await session.execute(text("""
                    UPDATE influencer_recipes SET creator_name = :name, recipe_markdown = :md, is_verified = 1
                    WHERE recipe_id = :rid
                """), {**params, "rid": existing[0]})
            else:
                await session.execute(text("""
                    INSERT INTO influencer_recipes (creator_id, creator_name, recipe_title, recipe_markdown, is_verified)
                    VALUES (:cid, :name, :title, :md, 1)
                """), params)


async def seed_fans(session) -> None:
    names = {inf["creator_id"]: inf["name"] for inf in INFLUENCERS}
    for fan in FANS:
        row = (await session.execute(text("SELECT user_id FROM users WHERE email = :e"), {"e": fan["email"]})).first()
        if row:
            uid = row[0]
        else:
            uid = (await session.execute(text("""
                INSERT INTO users (email, password, name, appliances, preferences, cooking_level)
                VALUES (:email, :password, :name, :appliances, :preferences, 'beginner')
            """), {"email": fan["email"], "password": UserModel.hash_password(FAN_PASSWORD), "name": fan["name"],
                   "appliances": json.dumps(fan["appliances"], ensure_ascii=False),
                   "preferences": json.dumps(fan["preferences"], ensure_ascii=False)})).lastrowid

        for creator_id in fan["follows"]:  # 찜 상태 + 협업 필터링용 행동 로그 (앱의 찜하기와 같은 두 행)
            await session.execute(text("INSERT IGNORE INTO influencer_follows (user_id, creator_id) VALUES (:u, :c)"),
                                  {"u": uid, "c": creator_id})
            logged = (await session.execute(text("""
                SELECT 1 FROM user_interactions
                WHERE user_id = :u AND item_type = 'influencer' AND item_id = :c AND action = 'wish'
            """), {"u": uid, "c": creator_id})).first()
            if not logged:
                await session.execute(text("""
                    INSERT INTO user_interactions (user_id, item_type, item_id, action, weight, label)
                    VALUES (:u, 'influencer', :c, 'wish', 5, :label)
                """), {"u": uid, "c": creator_id, "label": names[creator_id]})
        for report_no in fan["products"]:
            await session.execute(text("INSERT IGNORE INTO wishlists (user_id, food_id) VALUES (:u, :f)"),
                                  {"u": uid, "f": report_no})
        for title in fan["saved"]:
            saved = (await session.execute(text(
                "SELECT 1 FROM mypage_logs WHERE user_id = :u AND log_type = 'recipe' AND title = :t"),
                {"u": uid, "t": title})).first()
            if not saved:
                await session.execute(text("""
                    INSERT INTO mypage_logs (user_id, log_type, title, content) VALUES (:u, 'recipe', :t, :c)
                """), {"u": uid, "t": title, "c": json.dumps({"markdown": recipe_body(title)}, ensure_ascii=False)})


async def prune_orphan_follows(session) -> int:
    # 크리에이터가 없는 예전 테스트용 찜 로그(creator-1 등)는 추천 계산만 어지럽히므로 지운다
    result = await session.execute(text("""
        DELETE FROM user_interactions
        WHERE item_type = 'influencer'
          AND item_id NOT IN (SELECT creator_id FROM influencer_recipes WHERE is_verified = 1)
    """))
    await session.execute(text("""
        DELETE FROM influencer_follows
        WHERE creator_id NOT IN (SELECT creator_id FROM influencer_recipes WHERE is_verified = 1)
    """))
    return result.rowcount


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        await seed_creators(session)
        await seed_fans(session)
        pruned = await prune_orphan_follows(session)
        await session.commit()
    print(f"influencers seeded: {len(INFLUENCERS)} creators, {sum(len(i['recipes']) for i in INFLUENCERS)} recipes, "
          f"{len(FANS)} fan users (orphan follow logs removed: {pruned})")


async def cleanup() -> None:
    async with AsyncSessionLocal() as session:
        ids = (await session.execute(text("SELECT user_id FROM users WHERE email LIKE :p"), {"p": FAN_EMAIL_PATTERN})).scalars().all()
        for uid in ids:  # influencer_follows / user_interactions 는 FK cascade 로 함께 지워진다
            await session.execute(text("DELETE FROM mypage_logs WHERE user_id = :u"), {"u": uid})
            await session.execute(text("DELETE FROM wishlists WHERE user_id = :u"), {"u": uid})
            await session.execute(text("DELETE FROM users WHERE user_id = :u"), {"u": uid})
        for creator_id in CREATOR_IDS:
            await session.execute(text("DELETE FROM user_interactions WHERE item_type = 'influencer' AND item_id = :c"), {"c": creator_id})
            await session.execute(text("DELETE FROM influencer_follows WHERE creator_id = :c"), {"c": creator_id})
            await session.execute(text("DELETE FROM influencer_recipes WHERE creator_id = :c"), {"c": creator_id})
            await session.execute(text("DELETE FROM influencer_profiles WHERE creator_id = :c"), {"c": creator_id})
        await session.commit()
    print(f"influencer demo removed: {len(CREATOR_IDS)} creators, {len(ids)} fan users")


async def check() -> None:
    # 각 시드 레시피가 실제 상품 DB의 주재료·조미료 상품과 매칭되는지 서비스 로직 그대로 확인한다
    async with AsyncSessionLocal() as session:
        for inf in INFLUENCERS:
            for recipe in inf["recipes"]:
                result = await recommend.recipe_products(session, None, recipe["title"], recipe["markdown"])
                names = ", ".join(f"{i['productName']}(NOVA {i['novaGroup']})" for i in result["items"]) or "매칭 없음"
                print(f"[{inf['name']}] {recipe['title']} → {names}")
        missing = [r for r in {rn for fan in FANS for rn in fan["products"]}
                   if not (await session.execute(text("SELECT 1 FROM active_food_catalog WHERE report_no = :r"), {"r": r})).first()]
        print("팬 찜 상품 중 카탈로그에 없는 report_no:", missing or "없음")


async def main() -> None:
    action = cleanup if "--cleanup" in sys.argv else check if "--check" in sys.argv else seed
    await action()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
