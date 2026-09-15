from __future__ import annotations

import unittest

from modules.chapters import get_chapters


class ChapterGenerationTests(unittest.TestCase):
    def test_god_level_code_uses_valid_function_identifier(self) -> None:
        modules = get_chapters()
        target = next(
            lesson
            for module in modules
            for lesson in module["lessons"]
            if lesson["title"] == "Exploring modules with dir() and __main__"
        )

        god_code = target["difficulty_content"]["God"]["code"]
        self.assertIn("def audit_exploring_modules_with_dir_and_main():", god_code)
        self.assertNotIn("()", god_code.splitlines()[0].replace("():", ""))


if __name__ == "__main__":
    unittest.main()
