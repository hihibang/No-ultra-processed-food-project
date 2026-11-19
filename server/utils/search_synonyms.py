# utils/search_synonyms.py
# 검색어 정규화와 유의어·표기 차이 확장 (예: '초콜릿' ↔ '초코', '오뎅' ↔ '어묵').
# 그룹 안의 표기는 서로 대체 가능하다. 검색어에 그룹 표기가 포함돼 있으면(예: '초콜릿칩') 대체한 형태도 함께 찾는다.
SYNONYM_GROUPS = [
    ("초콜릿", "초코", "초콜렛"),
    ("어묵", "오뎅"),
    ("스파게티", "파스타"),
    ("짜장", "자장"),
    ("돈까스", "돈가스", "돈카츠"),
    ("계란", "달걀"),
    ("케첩", "케찹"),
    ("마요네즈", "마요네스"),
]
MAX_VARIANTS = 8


def normalize(text: str | None) -> str:
    """소문자 + 공백 제거. 상품명의 띄어쓰기 차이('초코 볼' / '초코볼')를 무시하기 위함."""
    return "".join(str(text or "").split()).lower()


def expand_keyword(text: str | None) -> list[str]:
    """검색어와 유의어 표기 후보 목록. 첫 번째 항목은 항상 정규화된 원래 검색어."""
    base = normalize(text)
    if not base:
        return []
    variants = [base]
    for group in SYNONYM_GROUPS:
        for term in group:
            if term not in base:
                continue
            for other in group:
                if other == term:
                    continue
                candidate = base.replace(term, other)
                if candidate not in variants:
                    variants.append(candidate)
    return variants[:MAX_VARIANTS]
