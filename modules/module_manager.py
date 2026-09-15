from __future__ import annotations

from typing import Iterable


def module_by_id(modules: Iterable[dict], module_id: str) -> dict | None:
    return next((module for module in modules if module["id"] == module_id), None)


def lesson_by_id(module: dict, lesson_id: str) -> dict | None:
    return next((lesson for lesson in module["lessons"] if lesson["id"] == lesson_id), None)


def neighboring_lessons(module: dict, lesson_id: str) -> tuple[dict | None, dict | None]:
    lessons = module["lessons"]
    for index, lesson in enumerate(lessons):
        if lesson["id"] != lesson_id:
            continue
        previous_lesson = lessons[index - 1] if index > 0 else None
        next_lesson = lessons[index + 1] if index < len(lessons) - 1 else None
        return previous_lesson, next_lesson
    return None, None
