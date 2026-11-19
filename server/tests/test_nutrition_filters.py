# tests/test_nutrition_filters.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_nutrition_filters
import unittest

from utils import nutrition_filters as nf


def _row(**overrides):
    base = {
        "total_weight": "100g", "sugars": 1.0, "trans_fat": 0.0, "sodium": 50.0, "protein": 12.0,
        "raw_materials": "정제수, 밀가루",
    }
    base.update(overrides)
    return base


class UnitTest(unittest.TestCase):
    def test_liquid_detection(self):
        self.assertTrue(nf.is_liquid("600ml"))
        self.assertTrue(nf.is_liquid("1.5 L"))
        self.assertFalse(nf.is_liquid("220g"))
        self.assertFalse(nf.is_liquid(None))  # 단위 불명은 고형으로 본다


class NutritionTest(unittest.TestCase):
    def test_low_sugar_solid_and_liquid_limits(self):
        self.assertTrue(nf.passes_nutrition(_row(sugars=4.9), "lowSugar"))
        self.assertFalse(nf.passes_nutrition(_row(sugars=5.0), "lowSugar"))
        # 액체는 100mL당 2.5g 미만
        self.assertFalse(nf.passes_nutrition(_row(total_weight="500ml", sugars=3.0), "lowSugar"))
        self.assertTrue(nf.passes_nutrition(_row(total_weight="500ml", sugars=2.4), "lowSugar"))

    def test_trans_fat_boundary(self):
        self.assertTrue(nf.passes_nutrition(_row(trans_fat=0.0), "zeroTransFat"))
        self.assertTrue(nf.passes_nutrition(_row(trans_fat=0.19), "zeroTransFat"))
        self.assertFalse(nf.passes_nutrition(_row(trans_fat=0.2), "zeroTransFat"))

    def test_low_sodium_boundary(self):
        self.assertTrue(nf.passes_nutrition(_row(sodium=119.9), "lowSodium"))
        self.assertFalse(nf.passes_nutrition(_row(sodium=120), "lowSodium"))

    def test_high_protein_solid_and_liquid(self):
        self.assertTrue(nf.passes_nutrition(_row(protein=11), "highProtein"))
        self.assertFalse(nf.passes_nutrition(_row(protein=10.9), "highProtein"))
        self.assertTrue(nf.passes_nutrition(_row(total_weight="250ml", protein=5.5), "highProtein"))

    def test_null_or_unparseable_values_are_excluded(self):
        self.assertFalse(nf.passes_nutrition(_row(sugars=None), "lowSugar"))
        self.assertFalse(nf.passes_nutrition(_row(trans_fat="N/A"), "zeroTransFat"))
        self.assertFalse(nf.passes_nutrition(_row(protein=float("nan")), "highProtein"))


class AdditiveTest(unittest.TestCase):
    def test_keyword_match_is_case_insensitive(self):
        self.assertTrue(nf.contains_excluded_additive("정제수, l-글루탐산나트륨", "noFlavorEnhancer"))
        self.assertTrue(nf.contains_excluded_additive("정제수, msg", "noFlavorEnhancer"))
        self.assertTrue(nf.contains_excluded_additive("구연산, 소브산칼륨", "noPreservative"))
        self.assertFalse(nf.contains_excluded_additive("정제수, 밀가루", "noColorant"))
        self.assertFalse(nf.contains_excluded_additive(None, "noSweetener"))


class CombinedTest(unittest.TestCase):
    def test_nutrition_filters_are_and_combined(self):
        row = _row(sugars=1.0, sodium=50.0, protein=12.0)
        self.assertTrue(nf.passes_filters(row, ["lowSugar", "lowSodium", "highProtein"], []))
        self.assertFalse(nf.passes_filters(_row(protein=3.0), ["lowSugar", "highProtein"], []))

    def test_additive_exclusion_combines_with_nutrition(self):
        row = _row(raw_materials="정제수, 아스파탐")
        self.assertFalse(nf.passes_filters(row, ["lowSugar"], ["noSweetener"]))
        self.assertTrue(nf.passes_filters(row, ["lowSugar"], ["noPreservative"]))

    def test_no_filters_passes_everything(self):
        self.assertTrue(nf.passes_filters(_row(sugars=None), [], []))


if __name__ == "__main__":
    unittest.main()
