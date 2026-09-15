DIFFICULTY_LEVELS = ["Beginner", "Average", "Expert", "God"]

LESSONS = [
    {
        "id": "python-basics",
        "topic": "Basics",
        "title": "Python Basics",
        "description": "Learn variables, data types, and simple output.",
        "objectives": [
            "Understand variables and basic data types",
            "Print values to the screen",
            "Read code line by line without feeling lost",
        ],
        "levels": {
            "Beginner": {
                "code": """name = "Hira"\nage = 28\nis_learning = True\n\nprint(name)\nprint(age)\nprint(is_learning)""",
                "explanation": "A variable is like a labeled box. We store text, numbers, and True/False values in boxes, then print them one by one.",
            },
            "Average": {
                "code": """name = "Hira"\nage = 28\nis_learning = True\n\nprint(f"Name: {name}")\nprint(f"Age: {age}")\nprint(f"Learning Python: {is_learning}")""",
                "explanation": "This version still uses simple variables, but f-strings make the output easier to read by mixing text and variable values together.",
            },
            "Expert": {
                "code": """def describe_user(name: str, age: int, is_learning: bool) -> str:\n    return f"{name} is {age} years old. Learning Python: {is_learning}"\n\nprint(describe_user("Hira", 28, True))""",
                "explanation": "We wrap the logic inside a function and add type hints. This makes the code reusable and clearer for future readers.",
            },
            "God": {
                "code": """from dataclasses import dataclass\n\n@dataclass\nclass Learner:\n    name: str\n    age: int\n    is_learning: bool = True\n\n    def summary(self) -> str:\n        status = "actively learning" if self.is_learning else "not learning right now"\n        return f"{self.name} ({self.age}) is {status}."\n\nlearner = Learner(name="Hira", age=28)\nprint(learner.summary())""",
                "explanation": "This version models the learner as structured data with a dataclass. It is more advanced because it combines attributes and behavior in one reusable object.",
            },
        },
    },
    {
        "id": "string-operations",
        "topic": "Strings",
        "title": "String Operations",
        "description": "Practice joining, cleaning, and formatting text.",
        "objectives": [
            "Join strings together",
            "Change text to upper or lower case",
            "Format messages clearly",
        ],
        "levels": {
            "Beginner": {
                "code": """first_name = "python"\nlast_name = "student"\nfull_name = first_name + " " + last_name\n\nprint(full_name)\nprint(full_name.upper())""",
                "explanation": "Strings are text values. We join two strings with + and a space, then call .upper() to show the same text in capital letters.",
            },
            "Average": {
                "code": """first_name = "python"\nlast_name = "student"\nfull_name = f"{first_name} {last_name}"\nclean_name = full_name.title()\n\nprint(f"Welcome, {clean_name}!")""",
                "explanation": "f-strings build text more cleanly, and .title() changes each word so it starts with a capital letter.",
            },
            "Expert": {
                "code": """def build_welcome_message(first_name: str, last_name: str) -> str:\n    clean_name = f"{first_name.strip()} {last_name.strip()}".title()\n    return f"Welcome, {clean_name}!"\n\nprint(build_welcome_message(" python ", "student "))""",
                "explanation": "The function removes extra spaces with .strip(), formats the name, and returns the message instead of printing inside the function.",
            },
            "God": {
                "code": """from typing import Iterable\n\ndef normalize_words(words: Iterable[str]) -> str:\n    normalized = [word.strip().title() for word in words if word.strip()]\n    return " ".join(normalized)\n\nmessage = f"Welcome, {normalize_words([' python ', 'student '])}!"\nprint(message)""",
                "explanation": "Here we use a list comprehension and an iterable type hint to clean many text pieces in a flexible, reusable way.",
            },
        },
    },
    {
        "id": "lists-and-collections",
        "topic": "Collections",
        "title": "Lists and Collections",
        "description": "Store many values together and loop through them.",
        "objectives": [
            "Create and update a list",
            "Loop through list items",
            "Use simple collection helpers",
        ],
        "levels": {
            "Beginner": {
                "code": """fruits = ["apple", "banana", "mango"]\nfruits.append("grape")\n\nfor fruit in fruits:\n    print(fruit)""",
                "explanation": "A list holds many items in one place. We add a new item with .append() and use a for loop to print each fruit.",
            },
            "Average": {
                "code": """fruits = ["apple", "banana", "mango", "grape"]\nprint(f"Total fruits: {len(fruits)}")\n\nfor index, fruit in enumerate(fruits, start=1):\n    print(index, fruit.title())""",
                "explanation": "len() counts list items and enumerate() gives both the position and the value while looping.",
            },
            "Expert": {
                "code": """from collections import Counter\n\nfruits = ["apple", "banana", "mango", "banana", "grape"]\nfruit_counter = Counter(fruits)\n\nfor fruit, count in fruit_counter.items():\n    print(f"{fruit}: {count}")""",
                "explanation": "Counter is useful when you want to count repeated values in a collection without writing the counting logic yourself.",
            },
            "God": {
                "code": """from collections import defaultdict\n\nscores = [("arrays", 8), ("loops", 7), ("arrays", 9)]\nlesson_scores = defaultdict(list)\n\nfor topic, score in scores:\n    lesson_scores[topic].append(score)\n\naverages = {topic: sum(values) / len(values) for topic, values in lesson_scores.items()}\nprint(averages)""",
                "explanation": "This version groups related values automatically with defaultdict and then computes averages with a dictionary comprehension.",
            },
        },
    },
    {
        "id": "functions",
        "topic": "Functions",
        "title": "Functions",
        "description": "Turn repeated work into reusable blocks of code.",
        "objectives": [
            "Create a function",
            "Pass input values as parameters",
            "Return results from a function",
        ],
        "levels": {
            "Beginner": {
                "code": """def say_hello():\n    print("Hello, Python learner!")\n\nsay_hello()""",
                "explanation": "A function is a named block of code. We define it once and call it when we want it to run.",
            },
            "Average": {
                "code": """def say_hello(name):\n    print(f"Hello, {name}!")\n\nsay_hello("Hira")""",
                "explanation": "Now the function accepts a parameter, which means the same function can greet different people.",
            },
            "Expert": {
                "code": """def add_numbers(first: int, second: int) -> int:\n    return first + second\n\nresult = add_numbers(5, 3)\nprint(f"Result: {result}")""",
                "explanation": "This version uses type hints and returns a value so other parts of the program can reuse the result.",
            },
            "God": {
                "code": """from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fibonacci(number: int) -> int:\n    if number < 2:\n        return number\n    return fibonacci(number - 1) + fibonacci(number - 2)\n\nprint(fibonacci(10))""",
                "explanation": "The decorator caches previous results, which makes a recursive solution much faster for repeated calculations.",
            },
        },
    },
    {
        "id": "conditionals-and-loops",
        "topic": "Control Flow",
        "title": "Conditionals and Loops",
        "description": "Make decisions and repeat tasks in Python.",
        "objectives": [
            "Use if/else statements",
            "Repeat work with loops",
            "Combine decisions with repetition",
        ],
        "levels": {
            "Beginner": {
                "code": """number = 5\n\nif number > 0:\n    print("Positive number")\nelse:\n    print("Zero or negative")\n\nfor item in range(3):\n    print(item)""",
                "explanation": "if/else lets the program choose between two paths. range(3) gives numbers 0, 1, and 2 for the loop.",
            },
            "Average": {
                "code": """scores = [45, 72, 88]\n\nfor score in scores:\n    if score >= 50:\n        print(f"{score}: pass")\n    else:\n        print(f"{score}: try again")""",
                "explanation": "This loop checks each score and prints a different message depending on the condition.",
            },
            "Expert": {
                "code": """def classify_scores(scores: list[int]) -> dict[str, int]:\n    summary = {"pass": 0, "fail": 0}\n    for score in scores:\n        key = "pass" if score >= 50 else "fail"\n        summary[key] += 1\n    return summary\n\nprint(classify_scores([45, 72, 88]))""",
                "explanation": "The function loops through scores, uses a conditional expression, and builds a summary dictionary that can be reused elsewhere.",
            },
            "God": {
                "code": """from itertools import groupby\n\nscores = sorted([45, 72, 88, 33, 51], key=lambda value: value >= 50)\nresult = {\n    "pass" if passed else "fail": list(group)\n    for passed, group in groupby(scores, key=lambda value: value >= 50)\n}\nprint(result)""",
                "explanation": "This version combines sorting, lambda functions, and groupby to organize scores by outcome in a compact advanced pattern.",
            },
        },
    },
]
