from __future__ import annotations

import json
import os
import tempfile
import unittest
from importlib import reload

import utils.progress as progress_module
from modules.chapters import get_chapters


class ProgressTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        os.environ["PYTHON_TUTOR_DATA_DIR"] = self.temp_dir.name
        reload(progress_module)
        self.modules = get_chapters()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()
        os.environ.pop("PYTHON_TUTOR_DATA_DIR", None)
        reload(progress_module)

    def test_profile_created_with_module_state(self) -> None:
        profile = progress_module.create_or_load_profile("Alice", self.modules)
        self.assertEqual(profile["username"], "Alice")
        self.assertIn("chapter_1", profile["modules"])
        self.assertEqual(profile["modules"]["chapter_1"]["status"], "Not Started")

    def test_mark_lesson_complete_updates_progress(self) -> None:
        profile = progress_module.create_or_load_profile("Alice", self.modules)
        module = self.modules[0]
        lesson = module["lessons"][0]
        first_completion, module_completed = progress_module.mark_lesson_complete(profile, module, lesson, "Average", 120)
        self.assertTrue(first_completion)
        self.assertFalse(module_completed)
        state = profile["modules"][module["id"]]
        self.assertIn(lesson["id"], state["completed_lessons"])
        self.assertGreater(state["progress_percent"], 0)
        self.assertEqual(profile["difficulty_usage"]["Average"], 1)
        self.assertEqual(profile["last_lesson_id"], module["lessons"][1]["id"])

    def test_restore_backup_normalizes_module_structure(self) -> None:
        profile = progress_module.create_or_load_profile("Alice", self.modules)
        payload = json.dumps({"username": "Alice", "modules": {"chapter_1": {"completed_lessons": [self.modules[0]['lessons'][0]['id']]}}}).encode("utf-8")
        restored = progress_module.restore_profile_backup(payload, self.modules)
        self.assertEqual(restored["username"], "Alice")
        self.assertEqual(restored["modules"]["chapter_1"]["completed_lessons"], [self.modules[0]["lessons"][0]["id"]])
        self.assertIn("chapter_11", restored["modules"])

    def test_record_lesson_time_updates_time_without_completion(self) -> None:
        profile = progress_module.create_or_load_profile("Alice", self.modules)
        module = self.modules[0]
        lesson = module["lessons"][0]
        progress_module.record_lesson_time(profile, module, lesson["id"], 90)
        self.assertEqual(profile["modules"][module["id"]]["time_spent_seconds"], 90)
        self.assertEqual(profile["last_lesson_id"], lesson["id"])
        day_values = next(iter(profile["daily_activity"].values()))
        self.assertEqual(day_values["lessons_completed"], 0)
        self.assertEqual(day_values["seconds"], 90)

    def test_restore_backup_rejects_invalid_payload(self) -> None:
        with self.assertRaises(ValueError):
            progress_module.restore_profile_backup(b"[]", self.modules)

    def test_safe_profile_name_removes_path_characters(self) -> None:
        self.assertEqual(progress_module.safe_profile_name("../outside /tmp/owned"), "outside_tmp_owned")


if __name__ == "__main__":
    unittest.main()
