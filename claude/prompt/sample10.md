아래 3가지 문제 및 신규 요구사항을 순차적으로 확인하고 관련 프론트엔드/백엔드 코드를 수정해줘.

---

### 1. 비교 실행 후 비교함 자동 비우기
- `/compare` 페이지에서 [비교 실행] 버튼을 클릭하여 `POST /api/comparisons` 요청이 성공하고 결과 모달(<ComparisonResultModal />)이 오픈되면, CompareContext의 비교함(compareList)을 자동으로 전체 비우기(clearCompare) 처리해줘.

---

### 2. 상품 목록(`Catalog.jsx`) 중복 노출 현상 해결
- 상품 목록 페이지에서 동일한 상품이 중복되어 노출되는 원인을 파악하고 수정해줘.
  - 백엔드 (`routes/food_routes.py` 또는 관련 API): `GET /api/foods` 등 목록 조회 시 정렬 기준(ORDER BY report_no 등) 및 중복 데이터(DISTINCT 또는 GROUP BY) 점검
  - 프론트엔드 (`Catalog.jsx`): 무한 스크롤 또는 페이지네이션 데이터 합침(`[...prev, ...next]`) 시 report_no 기준 중복 제거 처리 로직 추가

---

### 3. 비교 결과 모달에 [탄수화물] 항목 추가
- `ComparisonResultModal.jsx` 컴포넌트의 `NUTRITION_ROWS` 목록에 [탄수화물] 행을 추가해줘.
  - key: 'carbohydrates' (또는 백엔드 응답 키값), label: '탄수화물', unit: 'g', higherIsBetter: false
  - 백엔드 비교 리포트 응답 객체(nutrition) 및 DB/API 스키마에 탄수화물 항목이 올바르게 포함되어 연동되는지 함께 점검해줘.

---

기존 styled-components 구조 및 프로젝트 코드 컨벤션을 준수하여 작업을 진행하고 완료 후 결과를 알려줘.