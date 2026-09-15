from __future__ import annotations

import unittest
from datetime import date, timedelta

from modules.chapters import get_chapters
from utils.analytics import completion_stats, current_streak, module_snapshots, overall_progress
from utils.progress import _base_profile


class AnalyticsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.modules = get_chapters()
        self.profile = _base_profile("Analyst", self.modules)

    def test_overall_progress_reflects_completed_lessons(self) -> None:
        first_module = self.modules[0]
        first_lesson = first_module["lessons"][0]["id"]
        self.profile["modules"][first_module["id"]]["completed_lessons"] = [first_lesson]
        self.profile["modules"][first_module["id"]]["progress_percent"] = 33
        self.assertGreater(overall_progress(self.profile, self.modules), 0)

    def test_current_streak_counts_consecutive_days(self) -> None:
        today = date.today()
        self.profile["daily_activity"] = {
            (today - timedelta(days=2)).isoformat(): {"lessons_completed": 1, "seconds": 60},
            (today - timedelta(days=1)).isoformat(): {"lessons_completed": 1, "seconds": 60},
            today.isoformat(): {"lessons_completed": 1, "seconds": 60},
        }
        self.assertEqual(current_streak(self.profile), 3)

    def test_completion_stats_and_snapshots_match_module_count(self) -> None:
        stats = completion_stats(self.profile, self.modules)
        snapshots = module_snapshots(self.profile, self.modules)
        self.assertEqual(stats["total_modules"], 11)
        self.assertEqual(len(snapshots), 11)


if __name__ == "__main__":
    unittest.main()
