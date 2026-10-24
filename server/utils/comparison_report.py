# utils/comparison_report.py
from datetime import datetime, timezone
from typing import Iterable

from utils.health_score import calculate_health_score
from utils.upf_classifier import classify_food


def _num(value) -> float:
    return float(value or 0.0)


def build_comparison_item(row) -> dict:
    """active_food_catalog 한 행을 비교 리포트 항목으로 변환한다."""
    food = dict(row)
    classified = classify_food(food)
    health = calculate_health_score(classified)

    return {
        "reportNo": str(food["report_no"]),
        "productName": food["product_name"],
        "companyName": food["company_name"],
        "imageUrl": food.get("image_url"),
        "novaGroup": classified["novaGroup"],
        "statusText": classified["statusText"],
        "detectedMarkers": classified["detectedMarkers"],
        "healthScore": health["score"],
        "scoreBreakdown": {
            "novaDeduction": health["novaDeduction"],
            "upfDeduction": health["upfDeduction"],
            "nutritionDeduction": health["nutritionDeduction"],
            "appliedWarnings": health["appliedWarnings"],
        },
        "nutrition": {
            "calories": _num(food.get("calories")),
            "carbohydrate": _num(food.get("carbohydrate")),
            "protein": _num(food.get("protein")),
            "fat": _num(food.get("fat")),
            "sugars": _num(food.get("sugars")),
            "sodium": _num(food.get("sodium")),
            "saturatedFat": _num(food.get("saturated_fat")),
        },
    }


def build_comparison_report(rows: Iterable) -> dict:
    return {
        "items": [build_comparison_item(row) for row in rows],
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }
