백엔드/프론트엔드 전체에 [위시리스트 DB 연동], [비교함 & 결과 다시보기], [메인 페이지 카테고리 필터 연동 및 최신 상품 TOP 5] 기능을 구현해줘.

### 📋 1. 백엔드 (server/)

1. `utils/upf_classifier.py` 연동 및 건강 점수 계산:
   - `classify_food()` 결과(novaGroup, upfScore, detectedMarkers, nutritionWarnings)를 기반으로 100점 만점 건강 점수 환산 로직 구현:
     `Health Score = max(0, 100 - (NOVA등급별감점) - (upfScore * 5) - (영양경고감점))`
     (NOVA 1: 0점, NOVA 2: -10점, NOVA 3: -25점, NOVA 4: -45점 / 고당류:-10점, 고나트륨:-10점, 고포화지방:-5점)

2. 라우터 및 모델 (`routes/comparison_routes.py`, `models/comparison_model.py`):
   - `POST /api/comparisons`: 비교 실행 시 각 product_id(report_no)별 점수 및 비교 리포트 JSON을 산출하여 `comparison_logs`에 저장
   - `GET /api/comparisons`: 사용자의 과거 비교 히스토리 목록 조회
   - `GET /api/comparisons/{comparison_id}`: 저장된 특정 비교 세션의 상세 점수 및 비교 결과 데이터 반환

3. 메인 페이지용 식품 API (`routes/food_routes.py` 또는 `main.py`):
   - `GET /api/foods/recent?limit=5`: 가장 최근에 등록된 식품 5개 목록 반환 API 추가

---

### 🎨 2. 프론트엔드 (front/)

1. 메인 페이지 카테고리 필터 연동 (`front/src/pages/Home.jsx`):
   - 메인 페이지의 각 카테고리 버튼(베이커리, 음료/티, 디저트/스낵 등) 클릭 시, 카테고리 쿼리 파라미터(예: `/products?category=음료/티`)를 갖고 **상품 목록 페이지로 이동**
   - 상품 목록 페이지(`Catalog.jsx`)진입 시 해당 쿼리 파라미터를 읽어 자동으로 카테고리 필터가 선택 및 적용된 상태로 목록 출력

2. 메인 페이지 하단 최신 상품 (`front/src/pages/Home.jsx`):
   - 맨 아래 섹션에 `GET /api/foods/recent?limit=5`를 호출하여 **"최신 등록 상품 (TOP 5)"** 영역 추가
   - 기존 상품 카드 컴포넌트를 활용하여 5개 상품을 가로 카드 슬라이더 또는 그리드로 노출

3. 마이페이지 [비교 히스토리] 탭 (`front/src/pages/MyPage.jsx`):
   - 비교 로그 박스 우측에 **[결과 다시보기]** 버튼 구현
   - [결과 다시보기] 클릭 시 `GET /api/comparisons/{comparison_id}`를 호출하여 당시 비교했던 상품들의 건강 점수(100점 만점), NOVA 등급, 영양성분 비교 모달(또는 페이지) 출력

기존 UI 스타일 가이드 및 styled-components 구조를 준수하여 코드를 완료해줘.