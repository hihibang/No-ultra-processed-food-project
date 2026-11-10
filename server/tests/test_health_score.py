# tests/test_health_score.py
# 실행: cd server && python -m unittest tests.test_health_score
import unittest

from utils.health_score import calculate_health_score


def _classified(nova: int, upf: int = 0, warnings=None) -> dict:
    return {
        "novaGroup": nova,
        "upfScore": upf,
        "nutritionWarnings": warnings or [],
    }


class CalculateHealthScoreTest(unittest.TestCase):
    def test_nova1_without_penalties_is_100(self):
        result = calculate_health_score(_classified(nova=1))
        self.assertEqual(result["score"], 100)
        self.assertEqual(result["novaDeduction"], 0)

    def test_nova2_deducts_10(self):
        self.assertEqual(calculate_health_score(_classified(nova=2))["score"], 90)

    def test_nova3_deducts_25(self):
        self.assertEqual(calculate_health_score(_classified(nova=3))["score"], 75)

    def test_nova4_deducts_45(self):
        self.assertEqual(calculate_health_score(_classified(nova=4))["score"], 55)

    def test_upf_score_is_multiplied_by_5(self):
        result = calculate_health_score(_classified(nova=1, upf=3))
        self.assertEqual(result["upfDeduction"], 15)
        self.assertEqual(result["score"], 85)

    def test_nutrition_warnings_are_deducted_individually(self):
        # classify_food()는 경고가 있으면 해당 가산점을 upfScore에 포함하므로 upf=5(2+2+1)로 맞춘다
        result = calculate_health_score(_classified(
            nova=1,
            upf=5,
            warnings=["고당류 식품", "고나트륨 식품", "고포화지방 식품"],
        ))
        self.assertEqual(result["upfDeduction"], 0)
        self.assertEqual(result["nutritionDeduction"], 25)
        self.assertEqual(result["score"], 75)
        self.assertEqual(
            result["appliedWarnings"],
            ["고당류 식품", "고나트륨 식품", "고포화지방 식품"],
        )

    def test_unknown_warning_is_ignored(self):
        result = calculate_health_score(_classified(nova=1, warnings=["알 수 없는 경고"]))
        self.assertEqual(result["nutritionDeduction"], 0)
        self.assertEqual(result["appliedWarnings"], [])

    def test_nutrition_points_are_not_double_counted(self):
        # upfScore 5 = 마커 3점 + 고당류 가산점 2점 → 마커 점수는 3점만 감점
        result = calculate_health_score(_classified(
            nova=1,
            upf=5,
            warnings=["고당류 식품"],
        ))
        self.assertEqual(result["upfDeduction"], 15)
        self.assertEqual(result["nutritionDeduction"], 10)
        self.assertEqual(result["score"], 75)

    def test_carbohydrate_deduction_by_threshold(self):
        cases = [(49.9, 0), (50, 5), (79.9, 5), (80, 10), (150, 10)]
        for carbohydrate, expected in cases:
            with self.subTest(carbohydrate=carbohydrate):
                result = calculate_health_score(_classified(nova=1), {"carbohydrate": carbohydrate})
                self.assertEqual(result["carbohydrateDeduction"], expected)
                self.assertEqual(result["score"], 100 - expected)

    def test_carbohydrate_is_ignored_without_nutrition(self):
        result = calculate_health_score(_classified(nova=1))
        self.assertEqual(result["carbohydrateDeduction"], 0)
        self.assertEqual(
            calculate_health_score(_classified(nova=1), {"carbohydrate": None})["carbohydrateDeduction"], 0
        )

    def test_score_is_clamped_to_zero(self):
        # 마커 10점(-50) + 영양경고 3개(-25) + NOVA 4(-45) = -120 → 0
        result = calculate_health_score(_classified(
            nova=4,
            upf=15,
            warnings=["고당류 식품", "고나트륨 식품", "고포화지방 식품"],
        ))
        self.assertEqual(result["score"], 0)


if __name__ == "__main__":
    unittest.main()
