# tests/test_material_classifier.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_material_classifier
import unittest

from utils import material_classifier as mc

DICT = {"L-글루탐산나트륨", "소브산칼륨", "D-자일로오스", "구연산", "D-소비톨"}


class SplitTest(unittest.TestCase):
    def test_splits_on_commas_but_not_inside_parentheses(self):
        self.assertEqual(
            mc.split_materials("정제수, 설탕, 검정깨(흑임자), 채종유(유채유 또는 카놀라유)"),
            ["정제수", "설탕", "검정깨(흑임자)", "채종유(유채유 또는 카놀라유)"],
        )

    def test_empty_input(self):
        self.assertEqual(mc.split_materials(None), [])
        self.assertEqual(mc.split_materials("  "), [])


class AdditiveTest(unittest.TestCase):
    def test_dictionary_and_pattern_matches(self):
        self.assertTrue(mc.is_additive("L-글루탐산나트륨", DICT))      # 사전
        self.assertTrue(mc.is_additive("인산염혼합제제", DICT))         # 패턴: 제제
        self.assertTrue(mc.is_additive("탄산칼슘", DICT))              # 패턴: 칼슘
        self.assertTrue(mc.is_additive("치자황색소", DICT))            # 패턴: 색소
        self.assertTrue(mc.is_additive("잔탄검", DICT))                # 패턴: 검

    def test_common_raw_materials_are_not_additives(self):
        for name in ["정제수", "정제소금", "밀가루", "오징어", "냉동연육", "당근", "검정깨(흑임자)", "백설탕"]:
            self.assertFalse(mc.is_additive(name, DICT), name)


class OrderTest(unittest.TestCase):
    def test_product_name_ingredient_moves_to_top_and_additives_to_bottom(self):
        # 실제 DB 행: '[냉동] 오징어 볼' — 원래 순서에서는 오징어·냉동연육이 가운데 있었다
        raw = "인산염혼합제제, L-글루탐산나트륨, 당근, 파, 정제소금, 정제대두유, 밀가루, 오징어, 냉동연육, 소브산칼륨, D-자일로오스"
        result = mc.order_materials(mc.split_materials(raw), "[냉동] 오징어 볼", DICT)
        names = [item["name"] for item in result]
        self.assertEqual(names[0], "오징어")
        self.assertEqual(names[1:6], ["당근", "파", "정제소금", "정제대두유", "밀가루"])
        self.assertEqual(names[6], "냉동연육")
        self.assertEqual(names[7:], ["인산염혼합제제", "L-글루탐산나트륨", "소브산칼륨", "D-자일로오스"])
        self.assertTrue(all(item["isAdditive"] for item in result[7:]))
        self.assertFalse(any(item["isAdditive"] for item in result[:7]))

    def test_compound_seasoning_sits_between_raw_and_additives(self):
        raw = "구연산, 복합조미식품, 오징어, 정제수"
        names = [i["name"] for i in mc.order_materials(mc.split_materials(raw), "테스트", DICT)]
        self.assertEqual(names, ["오징어", "정제수", "복합조미식품", "구연산"])  # 오징어는 상품명 주원료라 맨 앞

    def test_db_order_kept_within_group_and_duplicates_removed(self):
        raw = "소스류, 정제수, 소스류, 밀가루"
        result = mc.order_materials(mc.split_materials(raw), "", DICT)
        self.assertEqual([i["name"] for i in result], ["정제수", "밀가루", "소스류"])

    def test_no_materials_gives_empty_list(self):
        self.assertEqual(mc.order_materials([], "상품", DICT), [])


if __name__ == "__main__":
    unittest.main()
