# tests/test_compare_upgrade.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_compare_upgrade
import unittest

from utils import compare_upgrade as cu


def _item(rno, health, nova=3, sugars=5.0, sodium=300.0, markers=0):
    return {
        "reportNo": rno, "productName": f"상품{rno}", "companyName": "회사", "imageUrl": None,
        "healthScore": health, "novaGroup": nova, "detectedMarkers": ["m"] * markers,
        "nutrition": {"sugars": sugars, "sodium": sodium},
    }


BASE = _item("B", 60, nova=4, sugars=20.0, sodium=800.0, markers=2)


class ReasonTest(unittest.TestCase):
    def test_reasons_cover_health_sugar_sodium_nova_and_markers(self):
        better = _item("X", 72, nova=2, sugars=5.0, sodium=500.0, markers=1)
        self.assertEqual(
            cu.upgrade_reasons(BASE, better),
            ["건강점수 +12점", "당류 감소", "나트륨 감소", "NOVA 등급 개선", "주의 성분 감소"],
        )

    def test_no_improvement_gives_no_reasons(self):
        self.assertEqual(cu.upgrade_reasons(BASE, _item("Y", 55, nova=4, sugars=20.0, sodium=800.0, markers=2)), [])


class PickUpgradeTest(unittest.TestCase):
    def test_upgrades_ranked_first_and_lower_health_excluded(self):
        pool = [BASE, _item("A", 70), _item("C", 65), _item("D", 50, sugars=1.0), _item("E", 60, nova=2)]
        picked = cu.pick_upgrades(BASE, pool, limit=3)
        self.assertEqual([item["reportNo"] for item, _ in picked], ["A", "C", "E"])
        self.assertTrue(all(reasons for _, reasons in picked))

    def test_base_already_top_gives_no_upgrades(self):
        pool = [BASE, _item("A", 40, nova=4), _item("C", 30, nova=4)]
        self.assertEqual(cu.pick_upgrades(BASE, pool), [])


def _wished(entries):
    return {u: {("product", p) for p in items} for u, items in entries.items()}


NAMES = {p: {"productName": f"상품{p}", "companyName": "회사", "imageUrl": None}
         for p in ["B", "A", "C", "D", "E", "F"]}


class SimilarWishlistTest(unittest.TestCase):
    def test_no_wish_data_returns_empty_without_error(self):
        self.assertEqual(cu.similar_user_wishlists({}, {}, {("product", "B")}, set(), NAMES, 1), [])

    def test_fewer_than_two_wishers_and_no_broadening_hides_section(self):
        wished = _wished({2: ["B", "A"], 3: ["B"]})
        self.assertEqual(cu.similar_user_wishlists(wished, {}, {("product", "B")}, set(), NAMES, 1), [])

    def test_two_wishers_in_compare_group_return_cards(self):
        wished = _wished({2: ["B", "A", "C"], 3: ["A", "D"], 1: ["B", "E"]})
        affinity = {2: {("product", "A"): 5.0}, 3: {("product", "A"): 5.0}}
        cards = cu.similar_user_wishlists(
            wished, affinity, {("product", "B"), ("product", "A")}, set(), NAMES, 1)
        self.assertEqual(len(cards), 2)  # 본인(1)은 제외
        self.assertEqual(cards[0]["scope"], "compare_group")
        self.assertEqual(cards[0]["userLabel"], "찜 취향 유저 A")
        self.assertNotIn("user", cards[0]["userLabel"].lower().replace("유저", ""))
        self.assertTrue(all(item["reportNo"] not in {"B", "A"} for item in cards[0]["wishedItems"]))

    def test_broadens_to_same_type_when_compare_group_has_too_few(self):
        wished = _wished({2: ["B", "C"], 3: ["D"]})  # C, D 는 같은 유형 (비교군 밖)
        cards = cu.similar_user_wishlists(
            wished, {}, {("product", "B")}, {("product", "C"), ("product", "D")}, NAMES, 1)
        self.assertEqual(len(cards), 2)
        self.assertEqual(cards[0]["scope"], "same_type")

    def test_limits_are_applied(self):
        many = {u: ["B", "A", "C", "D", "E", "F"] for u in range(2, 8)}
        cards = cu.similar_user_wishlists(_wished(many), {}, {("product", "B")}, set(), NAMES, 1)
        self.assertLessEqual(len(cards), cu.SIMILAR_USER_LIMIT)
        self.assertTrue(all(len(c["wishedItems"]) <= cu.WISHED_ITEMS_PER_USER for c in cards))


if __name__ == "__main__":
    unittest.main()
