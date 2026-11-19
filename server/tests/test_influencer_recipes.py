# tests/test_influencer_recipes.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_influencer_recipes
import unittest

from utils import influencer_recipe_service as irs


def _recipe(rid, creator, title="레시피"):
    return {"recipe_id": rid, "creator_id": creator, "creator_name": f"크리에이터 {creator}", "recipe_title": title}


RECIPES = [
    _recipe(1, "creator-1", "A1"),
    _recipe(2, "creator-2", "B1"),
    _recipe(3, "creator-2", "B2"),
    _recipe(4, "creator-3", "C1"),
]


class PickTest(unittest.TestCase):
    def test_followed_creator_recipe_comes_first_with_its_badge(self):
        picked = irs.pick_influencer_recipes(RECIPES, {"creator-2"}, {"creator-3": 5.0})
        self.assertEqual(picked[0]["recipeId"], 2)
        self.assertEqual(picked[0]["source"], irs.SOURCE_FOLLOWED)
        self.assertEqual(picked[0]["badge"], "내가 찜한 크리에이터 레시피")

    def test_fills_with_similar_user_creator_when_followed_is_short(self):
        # creator-1 은 찜한 크리에이터(레시피 1개) → 부족한 한 자리를 유사 취향 creator-3 의 레시피로 채운다
        picked = irs.pick_influencer_recipes(RECIPES, {"creator-1"}, {"creator-3": 5.0, "creator-2": 1.0})
        self.assertEqual([p["recipeId"] for p in picked], [1, 4])
        self.assertEqual(picked[1]["source"], irs.SOURCE_SIMILAR)
        self.assertEqual(picked[1]["badge"], "유사 취향 유저 픽 인플루언서 레시피")

    def test_similar_pick_takes_one_recipe_per_creator_and_skips_followed(self):
        picked = irs.pick_influencer_recipes(RECIPES, {"creator-1"}, {"creator-2": 9.0, "creator-1": 8.0}, limit=2)
        self.assertEqual([p["recipeId"] for p in picked], [1, 2])  # creator-1 은 찜(followed)으로 한 번만, creator-2 는 1개만
        self.assertEqual([p["source"] for p in picked], [irs.SOURCE_FOLLOWED, irs.SOURCE_SIMILAR])

    def test_no_signal_returns_empty(self):
        self.assertEqual(irs.pick_influencer_recipes(RECIPES, set(), {}), [])

    def test_no_verified_recipes_returns_empty(self):
        self.assertEqual(irs.pick_influencer_recipes([], {"creator-1"}, {"creator-2": 1.0}), [])

    def test_limit_is_respected(self):
        picked = irs.pick_influencer_recipes(RECIPES, {"creator-2"}, {"creator-3": 5.0}, limit=1)
        self.assertEqual(len(picked), 1)

    def test_only_given_recipes_are_candidates_so_user_recipes_cannot_leak(self):
        # 후보 풀은 검수 테이블의 행만이다. 유저 저장 레시피는 이 목록에 들어올 수 없다 (모델이 is_verified=1 만 읽는다)
        picked = irs.pick_influencer_recipes(RECIPES, {"creator-1", "creator-2", "creator-3"}, {})
        self.assertTrue(set(p["recipeId"] for p in picked) <= {1, 2, 3, 4})


if __name__ == "__main__":
    unittest.main()
