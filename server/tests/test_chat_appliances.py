# 실행: cd server && .venv/bin/python -m unittest tests.test_chat_appliances
import unittest

from utils import chat_profile as cp


def profile(appliances):
    return cp.normalize_profile({"cookingLevel": "beginner", "appliances": appliances, "preferences": [], "restrictions": ""})


MICROWAVE_ONLY = profile(["전자레인지"])


class ProfileBlockTest(unittest.TestCase):
    def test_unchecked_tools_are_listed_as_unusable(self):
        block = cp.build_profile_block(MICROWAVE_ONLY)
        self.assertIn("사용 가능한 주방 도구 (이것만 사용): 전자레인지", block)
        unusable_line = [l for l in block.splitlines() if "사용 불가" in l][0]
        for name in ("인덕션", "가스레인지", "에어프라이어", "오븐", "믹서기"):
            self.assertIn(name, unusable_line)
        self.assertNotIn("전자레인지", unusable_line)

    def test_microwave_only_forbids_fire_cooking(self):
        rules = "\n".join(cp.build_appliance_rules(MICROWAVE_ONLY))
        self.assertIn("불을 쓰는 조리", rules)
        self.assertIn("전자레인지 전용", rules)

    def test_stove_owner_is_not_told_to_avoid_fire(self):
        rules = "\n".join(cp.build_appliance_rules(profile(["전자레인지", "인덕션"])))
        self.assertNotIn("불을 쓰는 조리", rules)
        self.assertIn("가스레인지", rules)  # 체크하지 않은 가스레인지는 사용 불가

    def test_nothing_checked_means_no_restriction(self):
        self.assertEqual(cp.build_appliance_rules(profile([])), [])
        self.assertEqual(cp.find_appliance_violations("프라이팬에 볶아요", profile([])), [])


class ViolationTest(unittest.TestCase):
    def test_pan_frying_is_a_violation_for_microwave_only(self):
        for text in ("팬에 기름을 두르고 굽습니다.", "중불에서 3분 볶아요.", "냄비에 물을 끓이세요.", "인덕션을 켜세요."):
            self.assertTrue(cp.find_appliance_violations(text, MICROWAVE_ONLY), text)

    def test_microwave_recipe_passes(self):
        text = "### 머그컵 계란찜\n1. 머그컵에 계란과 물을 넣고 섞어요.\n2. 전자레인지에 **1분 30초** 돌려요."
        self.assertEqual(cp.find_appliance_violations(text, MICROWAVE_ONLY), [])

    def test_unusable_tool_name_is_a_violation_unless_negated(self):
        self.assertEqual(cp.find_appliance_violations("에어프라이어에 10분 돌려요", profile(["전자레인지", "인덕션"])), ["에어프라이어"])
        self.assertEqual(cp.find_appliance_violations("오븐 없이 전자레인지로 만들 수 있어요", MICROWAVE_ONLY), [])

    def test_stove_owner_may_use_pan(self):
        self.assertEqual(cp.find_appliance_violations("팬에 볶아요", profile(["인덕션"])), [])


if __name__ == "__main__":
    unittest.main()
