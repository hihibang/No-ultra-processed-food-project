# tests/test_search_synonyms.py
# 실행: cd server && .venv/bin/python -m unittest tests.test_search_synonyms
import unittest

from utils import search_synonyms as ss


class ExpandTest(unittest.TestCase):
    def test_chocolate_matches_choco_spelling(self):
        self.assertIn("초코", ss.expand_keyword("초콜릿"))

    def test_choco_matches_chocolate_spelling(self):
        self.assertIn("초콜릿", ss.expand_keyword("초코"))

    def test_fish_cake_both_ways(self):
        self.assertIn("어묵", ss.expand_keyword("오뎅"))
        self.assertIn("오뎅", ss.expand_keyword("어묵"))

    def test_compound_word_keeps_its_suffix(self):
        self.assertIn("초코칩", ss.expand_keyword("초콜릿칩"))

    def test_original_query_is_first_and_normalized(self):
        self.assertEqual(ss.expand_keyword(" 초코 볼 ")[0], "초코볼")

    def test_unrelated_query_has_only_itself(self):
        self.assertEqual(ss.expand_keyword("두부"), ["두부"])

    def test_empty_query(self):
        self.assertEqual(ss.expand_keyword("   "), [])


if __name__ == "__main__":
    unittest.main()
