# utils/health_score.py
from utils.upf_classifier import NUTRITION_WARNING_POINTS

# NOVA 등급별 감점
NOVA_DEDUCTIONS = {1: 0, 2: 10, 3: 25, 4: 45}

# classify_food()가 nutritionWarnings에 담는 문자열 → 감점
NUTRITION_WARNING_DEDUCTIONS = {
    "고당류 식품": 10,
    "고나트륨 식품": 10,
    "고포화지방 식품": 5,
}

# UPF 점수 1점당 감점
UPF_SCORE_MULTIPLIER = 5


def calculate_health_score(classified: dict) -> dict:
    """classify_food() 결과를 100점 만점 건강 점수로 환산한다.

    Health Score = max(0, 100 - NOVA감점 - upfScore × 5 - 영양경고감점)

    classify_food()의 upfScore에는 영양경고 가산점이 이미 포함되어 있으므로,
    upf 감점에서는 그 가산점을 빼고 마커 점수만 사용한다.
    영양 요소는 영양경고 감점으로만 한 번 반영된다.
    """
    nova_group = classified["novaGroup"]
    warnings = classified["nutritionWarnings"]

    applied_warnings = [w for w in warnings if w in NUTRITION_WARNING_DEDUCTIONS]

    nutrition_points = sum(NUTRITION_WARNING_POINTS[w] for w in applied_warnings)
    marker_score = max(0, classified["upfScore"] - nutrition_points)

    nova_deduction = NOVA_DEDUCTIONS[nova_group]
    upf_deduction = marker_score * UPF_SCORE_MULTIPLIER
    nutrition_deduction = sum(NUTRITION_WARNING_DEDUCTIONS[w] for w in applied_warnings)

    score = max(0, 100 - nova_deduction - upf_deduction - nutrition_deduction)

    return {
        "score": score,
        "novaDeduction": nova_deduction,
        "upfDeduction": upf_deduction,
        "nutritionDeduction": nutrition_deduction,
        "appliedWarnings": applied_warnings,
    }
