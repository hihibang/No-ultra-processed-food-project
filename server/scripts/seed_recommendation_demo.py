# scripts/seed_recommendation_demo.py
# 추천 엔진 시연/검증용 데이터 생성·삭제. 실행 전 개발 DB인지 반드시 확인하세요.
#   생성: cd server && .venv/bin/python -m scripts.seed_recommendation_demo
#   삭제: cd server && .venv/bin/python -m scripts.seed_recommendation_demo --cleanup
# 데모 사용자는 이메일이 demo-rec-*@example.test 인 계정으로만 만들고, 삭제 시 이 계정과 연결 데이터만 지운다.
import asyncio
import json
import sys

from sqlalchemy import text

from database import AsyncSessionLocal, engine
from models.user_model import UserModel

DEMO_EMAIL_PATTERN = "demo-rec-%@example.test"
DEMO_PASSWORD = "demo-only-password"

DEMO_USERS = [
    {"email": "demo-rec-1@example.test", "name": "데모1", "appliances": ["airFryer"], "preferences": ["healthy"],
     "recipes": ["된장찌개", "두부조림"], "products": ["2010033305534"]},
    {"email": "demo-rec-2@example.test", "name": "데모2", "appliances": ["airFryer"], "preferences": ["healthy"],
     "recipes": ["된장찌개", "두부조림", "잡채"], "products": ["2010033305534", "201504390322"]},
    {"email": "demo-rec-3@example.test", "name": "데모3", "appliances": ["microwave"], "preferences": ["spicy"],
     "recipes": ["잡채"], "products": ["201504390322"]},
]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        for demo in DEMO_USERS:
            existing = await session.execute(text("SELECT user_id FROM users WHERE email = :email"), {"email": demo["email"]})
            if existing.first():
                continue
            user_id = await session.execute(text("""
                INSERT INTO users (email, password, name, appliances, preferences, cooking_level)
                VALUES (:email, :password, :name, :appliances, :preferences, 'beginner')
            """), {
                "email": demo["email"],
                "password": UserModel.hash_password(DEMO_PASSWORD),
                "name": demo["name"],
                "appliances": json.dumps(demo["appliances"], ensure_ascii=False),
                "preferences": json.dumps(demo["preferences"], ensure_ascii=False),
            })
            uid = user_id.lastrowid
            for title in demo["recipes"]:
                await session.execute(text("""
                    INSERT INTO mypage_logs (user_id, log_type, title, content)
                    VALUES (:uid, 'recipe', :title, :content)
                """), {"uid": uid, "title": title,
                       "content": json.dumps({"markdown": f"# {title}\n데모 본문"}, ensure_ascii=False)})
            for report_no in demo["products"]:
                await session.execute(text("""
                    INSERT IGNORE INTO wishlists (user_id, food_id) VALUES (:uid, :food_id)
                """), {"uid": uid, "food_id": report_no})
        await session.commit()
    print("demo users seeded")


async def cleanup() -> None:
    async with AsyncSessionLocal() as session:
        ids = (await session.execute(text(
            "SELECT user_id FROM users WHERE email LIKE :pattern"), {"pattern": DEMO_EMAIL_PATTERN})).scalars().all()
        for uid in ids:
            await session.execute(text("DELETE FROM user_interactions WHERE user_id = :uid"), {"uid": uid})
            await session.execute(text("DELETE FROM mypage_logs WHERE user_id = :uid"), {"uid": uid})
            await session.execute(text("DELETE FROM wishlists WHERE user_id = :uid"), {"uid": uid})
            await session.execute(text("DELETE FROM users WHERE user_id = :uid"), {"uid": uid})
        await session.commit()
    print(f"demo users removed: {len(ids)}")


async def main() -> None:
    await (cleanup() if "--cleanup" in sys.argv else seed())
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
