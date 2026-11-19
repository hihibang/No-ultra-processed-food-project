# tests/test_recommendation_service.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_recommendation_service
# DB 없이 순수 계산 로직만 검증한다 (합성 데이터 사용).
import unittest
from datetime import datetime, timedelta

import numpy as np

from utils import recommendation_service as rs

NOW = datetime(2026, 11, 1, 12, 0, 0)


def _event(user, item_type, item_id, action, days_ago=0.0):
    return {
        "user_id": user,
        "item_type": item_type,
        "item_id": str(item_id),
        "action": action,
        "created_at": NOW - timedelta(days=days_ago),
    }


class WeightAndDecayTest(unittest.TestCase):
    def test_action_weights_follow_spec(self):
        self.assertEqual(rs.action_weight("view"), 1.0)
        self.assertEqual(rs.action_weight("click"), 2.0)
        self.assertEqual(rs.action_weight("compare"), 2.0)
        self.assertEqual(rs.action_weight("wish"), 5.0)
        self.assertEqual(rs.action_weight("save"), 5.0)
        self.assertEqual(rs.action_weight("unknown"), 0.0)

    def test_decay_halves_every_half_life(self):
        self.assertAlmostEqual(rs.time_decay(NOW, NOW), 1.0)
        self.assertAlmostEqual(rs.time_decay(NOW - timedelta(days=rs.HALF_LIFE_DAYS), NOW), 0.5)
        self.assertAlmostEqual(rs.time_decay(None, NOW), 1.0)

    def test_recent_action_outweighs_old_one(self):
        affinity, _, _ = rs.build_affinity(
            [_event(1, "product", "A", "wish", days_ago=0), _event(1, "product", "B", "wish", days_ago=90)],
            NOW,
        )
        self.assertGreater(affinity[1][("product", "A")], affinity[1][("product", "B")])


class AffinityTest(unittest.TestCase):
    def test_same_item_from_two_sources_is_counted_once(self):
        # 찜 테이블과 행동 로그에 같은 찜이 두 번 남아도 최댓값 하나로 계산한다
        events = [_event(1, "product", "P", "wish"), _event(1, "product", "P", "wish")]
        affinity, wished, _ = rs.build_affinity(events, NOW)
        self.assertAlmostEqual(affinity[1][("product", "P")], 5.0)
        self.assertIn(("product", "P"), wished[1])

    def test_compare_is_engaged_but_not_wished(self):
        affinity, wished, engaged = rs.build_affinity([_event(2, "product", "P", "compare")], NOW)
        self.assertAlmostEqual(affinity[2][("product", "P")], 2.0)
        self.assertNotIn(("product", "P"), wished.get(2, set()))
        self.assertIn(("product", "P"), engaged[2])


class NeighborTest(unittest.TestCase):
    def test_neighbors_exclude_self_and_rank_by_similarity(self):
        user_ids = [1, 2, 3]
        matrix = np.array([
            [1.0, 1.0, 0.0],  # 대상
            [1.0, 1.0, 0.0],  # 완전히 같은 취향
            [0.0, 0.0, 1.0],  # 겹치는 것 없음 → 제외
        ])
        neighbors = rs.find_neighbors(user_ids, matrix, 1, top_k=5)
        self.assertEqual([uid for uid, _ in neighbors], [2])
        self.assertAlmostEqual(neighbors[0][1], 1.0)

    def test_unknown_or_empty_inputs_return_no_neighbors(self):
        self.assertEqual(rs.find_neighbors([1], np.zeros((1, 0)), 1), [])
        self.assertEqual(rs.find_neighbors([1, 2], np.ones((2, 2)), None), [])


class SimilarRecipeTest(unittest.TestCase):
    def _context(self):
        events = [
            _event(1, "recipe", "된장찌개", "save", days_ago=1),  # 대상: 이미 저장
            _event(2, "recipe", "된장찌개", "save", days_ago=1),  # 이웃: 같은 레시피 저장
            _event(2, "recipe", "두부조림", "save", days_ago=2),  # 이웃이 저장, 대상은 아직 안 봄
            _event(3, "recipe", "잡채", "save", days_ago=2),       # 취향이 다른 이웃
        ]
        affinity, wished, engaged = rs.build_affinity(events, NOW)
        profiles = [
            {"user_id": 1, "appliances": ["airFryer"], "preferences": ["healthy"]},
            {"user_id": 2, "appliances": ["airFryer"], "preferences": ["healthy"]},
            {"user_id": 3, "appliances": ["microwave"], "preferences": ["spicy"]},
        ]
        user_ids, matrix = rs.build_user_matrix(affinity, profiles)
        return rs.RecommendationContext(
            now=NOW, affinity=affinity, wished=wished, engaged=engaged,
            titles={"두부조림": "두부조림"}, bodies={"두부조림": "# 두부조림\n본문"},
            user_ids=user_ids, matrix=matrix,
        )

    def test_collaborative_recommendation_excludes_seen_and_scores_match(self):
        ctx = self._context()
        neighbors = ctx.neighbors_of(1)
        self.assertEqual(neighbors[0][0], 2)
        seen = set(ctx.affinity[1].keys())
        scores = rs.score_neighbor_items(ctx.affinity, neighbors, "recipe", seen)
        ranked = rs.rank_scores(scores)
        self.assertEqual(ranked[0][0], ("recipe", "두부조림"))
        self.assertNotIn(("recipe", "된장찌개"), scores)  # 이미 본 레시피는 제외
        self.assertEqual(ranked[0][1]["supporters"], 1)

    def test_cold_start_user_gets_popular_recipes_without_error(self):
        ctx = self._context()
        seen = set(ctx.affinity.get(99, {}).keys())
        ranked = rs.rank_scores(rs.popularity(ctx.affinity, "recipe", seen))
        self.assertTrue(ranked)
        self.assertEqual(ranked[0][0][1], "된장찌개")  # 두 명이 저장해 가장 인기


class CrossDomainTest(unittest.TestCase):
    def test_fans_co_wished_items_ranked_by_fan_count(self):
        events = [
            _event(1, "influencer", "c1", "wish"),
            _event(2, "influencer", "c1", "wish"),
            _event(1, "product", "P1", "wish"),
            _event(2, "product", "P1", "wish"),
            _event(2, "product", "P2", "wish"),
            _event(3, "product", "P3", "wish"),  # 팬이 아님
        ]
        affinity, wished, _ = rs.build_affinity(events, NOW)
        target = ("influencer", "c1")
        self.assertEqual(rs.fan_count(wished, target), 2)
        ranked = rs.rank_cross_domain(target, affinity, wished, "product", 4)
        self.assertEqual(ranked[0], (("product", "P1"), 2))
        self.assertEqual(ranked[1], (("product", "P2"), 1))
        self.assertNotIn(("product", "P3"), [key for key, _ in ranked])


class SelectionTest(unittest.TestCase):
    def test_selection_rate_is_share_of_base_wishers(self):
        events = [
            _event(1, "product", "BASE", "wish"),
            _event(2, "product", "BASE", "wish"),
            _event(1, "product", "ALT", "wish"),
            _event(3, "product", "BASE", "compare"),  # 비교만 한 사용자는 찜 기준 모수에서 제외
        ]
        _, wished, engaged = rs.build_affinity(events, NOW)
        n, rates = rs.selection_summary(("product", "BASE"), wished, engaged)
        self.assertEqual(n, 2)
        self.assertAlmostEqual(rates[("product", "ALT")], 0.5)

    def test_no_data_gives_zero_sample(self):
        n, rates = rs.selection_summary(("product", "X"), {}, {})
        self.assertEqual((n, rates), (0, {}))


class RankingTest(unittest.TestCase):
    def _item(self, report_no, health):
        return {"reportNo": report_no, "healthScore": health}

    def test_wished_first_then_cf_then_health(self):
        candidates = [self._item("A", 90), self._item("B", 60), self._item("C", 70)]
        wished = {("product", "B")}
        cf = {("product", "C"): {"score": 3.0}}
        ranked = rs.rank_product_candidates(candidates, wished, cf, 3)
        self.assertEqual([item["reportNo"] for item in ranked], ["B", "C", "A"])
        self.assertTrue(ranked[0]["isWished"])
        self.assertIn("❤️ 내가 찜한 식재료", ranked[0]["badges"])
        self.assertIn("👥 유사 취향 Pick", ranked[1]["badges"])

    def test_cold_start_falls_back_to_health_score(self):
        candidates = [self._item("A", 40), self._item("B", 95)]
        ranked = rs.rank_product_candidates(candidates, set(), {}, 4)
        self.assertEqual(ranked[0]["reportNo"], "B")
        self.assertEqual(ranked[0]["badges"], [])


class KeywordTest(unittest.TestCase):
    def test_keywords_from_markdown_ingredient_section(self):
        markdown = (
            "# 두부조림\n"
            "## 재료\n"
            "- 두부 1모 (300g)\n"
            "- 간장 2큰술\n"
            "- 대파 1대\n"
            "## 조리 순서\n"
            "1. 두부를 자른다\n"
        )
        keywords = rs.extract_keywords("두부조림", markdown)
        self.assertIn("두부", keywords)
        self.assertIn("간장", keywords)
        self.assertIn("대파", keywords)
        self.assertNotIn("조리", keywords)

    def test_list_input_and_limit(self):
        keywords = rs.extract_keywords("", ["달걀", "우유", "설탕", "버터"], limit=2)
        self.assertEqual(keywords, ["달걀", "우유"])

    def test_empty_input_gives_no_keywords(self):
        self.assertEqual(rs.extract_keywords("", ""), [])


class RecipeKeyTest(unittest.TestCase):
    def test_recipe_key_ignores_spaces_and_case(self):
        self.assertEqual(rs.recipe_key(" 두부 조림 "), rs.recipe_key("두부조림"))
        self.assertEqual(rs.recipe_key("Kimchi Stew"), rs.recipe_key("kimchi stew"))


class CompareHelperTest(unittest.TestCase):
    def test_closest_health_excludes_base_and_sorts_by_score_gap(self):
        base = {"reportNo": "B", "healthScore": 70, "nutrition": {"calories": 200}}
        candidates = [
            {"reportNo": "B", "healthScore": 70, "nutrition": {"calories": 200}},
            {"reportNo": "X", "healthScore": 90, "nutrition": {"calories": 200}},
            {"reportNo": "Y", "healthScore": 72, "nutrition": {"calories": 200}},
        ]
        picked = rs.pick_closest_health(base, candidates, 3)
        self.assertEqual([item["reportNo"] for item in picked], ["Y", "X"])


class IngredientMatchTest(unittest.TestCase):
    def _row(self, name, product_type, raw=""):
        return {"report_no": name, "product_name": name, "product_type": product_type, "raw_materials": raw}

    def test_carrot_drink_cake_and_egg_snack_are_excluded(self):
        # '당근, 계란' 입력: 주스·케이크·과자는 부재료가 아니므로 전부 제외되어 빈 결과
        rows = [
            self._row("요미요미 유기농주스 보라당근포도", "과.채주스", "자색당근농축액"),
            self._row("당근 케이크", "빵류", "당근, 밀가루"),
            self._row("계란과자", "과자", "전란액, 밀가루"),
            self._row("오늘좋은 계란쿠키", "과자", "전란액, 백설탕"),
        ]
        self.assertEqual(rs.select_ingredient_matches(rows, ["당근", "계란"]), [])

    def test_ingredient_sauce_matching_keyword_is_kept(self):
        rows = [self._row("당근드레싱", "소스", "당근, 식용유, 식초")]
        matched = rs.select_ingredient_matches(rows, ["당근", "계란"])
        self.assertEqual([row["product_name"] for row, _ in matched], ["당근드레싱"])
        self.assertGreaterEqual(matched[0][1], rs.MATCH_THRESHOLD)

    def test_raw_material_only_match_is_below_threshold(self):
        # 원재료에만 당근이 들어간 양념은 상품명과 무관하므로 임계값 미만으로 버린다
        rows = [self._row("정통마늘양념", "소스", "마늘, 당근, 간장")]
        self.assertEqual(rs.select_ingredient_matches(rows, ["당근"]), [])

    def test_partial_name_match_without_raw_support_is_rejected(self):
        self.assertLess(rs.match_score("두부", "순두부찌개양념", "고추장, 설탕"), rs.MATCH_THRESHOLD)
        self.assertGreaterEqual(rs.match_score("두부", "순두부찌개양념", "두부, 고추장"), rs.MATCH_THRESHOLD)

    def test_unknown_special_ingredient_returns_no_matches(self):
        rows = [self._row("진두부순대", "즉석조리식품", "두부, 당근")]
        self.assertEqual(rs.select_ingredient_matches(rows, ["아주특이한재료"]), [])

    def test_finished_products_by_name_suffix_are_excluded(self):
        self.assertFalse(rs.is_ingredient_product(self._row("두부스낵", "소스")))
        self.assertFalse(rs.is_ingredient_product(self._row("과일음료 당근", "소스")))
        self.assertFalse(rs.is_ingredient_product(self._row("녹차 가루", "소스")))
        self.assertTrue(rs.is_ingredient_product(self._row("청정원 진간장", "소스")))
        # 상품명에 '차'가 들어 있어도 토큰 단위로만 걸러서 차돌박이는 살린다
        self.assertTrue(rs.is_ingredient_product(self._row("차돌박이 양념", "복합조미식품")))

    def test_non_ingredient_types_are_excluded_even_with_good_name(self):
        self.assertFalse(rs.is_ingredient_product(self._row("당근 샐러드", "즉석섭취식품")))
        self.assertFalse(rs.is_ingredient_product(self._row("당근 라면", "유탕면")))


class ProseIngredientTest(unittest.TestCase):
    def test_prose_answer_without_list_yields_ingredient_keywords(self):
        answer = (
            "어묵탕을 만들기 위해서는 일반적으로 어묵, 대파, 무, 다시마, 국간장을 준비하면 좋아요.\n"
        )
        keywords = rs.extract_keywords("어묵탕", answer)
        self.assertIn("어묵탕", keywords)
        self.assertIn("어묵", keywords)
        self.assertIn("국간장", keywords)  # '국간장을' → 조사 제거
        self.assertNotIn("위해서", keywords)
        self.assertNotIn("만들기", keywords)

    def test_prose_skips_cooking_steps_section(self):
        answer = "어묵탕에는 어묵과 무가 좋아요.\n## 조리 순서\n1. 물을 끓인다\n"
        keywords = rs.extract_keywords("", answer)
        self.assertIn("어묵", keywords)
        self.assertNotIn("끓인다", keywords)

    def test_particle_stripping_keeps_short_words(self):
        self.assertEqual(rs._strip_particle("어묵탕을"), "어묵탕")
        self.assertEqual(rs._strip_particle("오이"), "오이")  # '오' 한 글자로 줄지 않는다


class FoodTypeAndNameTest(unittest.TestCase):
    def _row(self, name, product_type, raw=""):
        return {"report_no": name, "product_name": name, "product_type": product_type, "raw_materials": raw}

    def test_fish_cake_and_processed_cooking_ingredients_are_allowed(self):
        rows = [
            self._row("삼호어묵 정통어묵탕Ⅲ", "어묵", "어묵, 복합조미식품"),
            self._row("삼호부산어묵종합II", "어묵", "어묵, 복합조미식품"),
        ]
        matched = rs.select_ingredient_matches(rows, ["어묵탕", "어묵"])
        self.assertEqual(len(matched), 2)

    def test_soy_sauce_inside_sauce_name_matches_by_core_token(self):
        rows = [self._row("슴슴국간장소스", "소스")]
        matched = rs.select_ingredient_matches(rows, ["국간장"])
        self.assertEqual(len(matched), 1)
        self.assertGreaterEqual(matched[0][1], rs.MATCH_THRESHOLD)

    def test_carrot_juice_stays_excluded_in_any_allowed_type(self):
        self.assertFalse(rs.is_ingredient_product(self._row("당근 주스", "과.채주스")))
        self.assertFalse(rs.is_ingredient_product(self._row("당근주스", "어묵")))
        self.assertFalse(rs.is_ingredient_product(self._row("초코사탕", "소스")))
        self.assertFalse(rs.is_ingredient_product(self._row("당근 라면", "유탕면")))


if __name__ == "__main__":
    unittest.main()
