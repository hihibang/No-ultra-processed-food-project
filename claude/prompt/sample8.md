백엔드/프론트엔드 전체에 [위시리스트 DB 연동] 및 [비교함 & 비교 히스토리 로그] 기능을 구축해줘.

### 🗄️ DB 전제 조건 (이미 생성 완료됨)
1. `wishlists` (wishlist_id, user_id, food_id, created_at) - (user_id, food_id) UNIQUE
2. `comparison_logs` (comparison_id, user_id, product_ids, created_at) - product_ids는 JSON 타입

---

### 📋 1. 백엔드 (server/)

1. schemas (`schemas/wishlist_schema.py`, `schemas/comparison_schema.py`):
   - WishlistCreateRequest: food_id(int)
   - WishlistResponse: wishlist_id(int), user_id(int), food_id(int), food_details(Optional[dict])
   - ComparisonLogCreateRequest: product_ids(List[int])
   - ComparisonLogResponse: comparison_id(int), user_id(int), product_ids(List[int]), foods(List[dict]), created_at(str)

2. models (`models/wishlist_model.py`, `models/comparison_model.py`):
   - WishlistModel: `get_user_wishlist`, `add_wishlist`, `remove_wishlist` (SQL `text()` 및 AsyncSession 바인딩)
   - ComparisonModel: `save_log`, `get_logs_by_user` (최신순 정렬)

3. routes (`routes/wishlist_routes.py`, `routes/comparison_routes.py`):
   - `GET /api/wishlist`: 사용자 찜 목록 조회 (food 테이블 JOIN 또는 조회로 상세 정보 포함)
   - `POST /api/wishlist`: 찜 추가 (409 중복 예외 처리)
   - `DELETE /api/wishlist/{food_id}`: 찜 해제
   - `GET /api/comparisons`: 사용자의 비교 기록 목록 조회
   - `POST /api/comparisons`: 비교 실행 시 비교 내역 로그 저장
   - `main.py`에 두 라우터 등록

---

### 🎨 2. 프론트엔드 (front/)

1. Compare Context (`front/src/contexts/CompareContext.jsx`):
   - 비교함 상태 관리 (`compareList`, `addToCompare`, `removeFromCompare`, `clearCompare`)
   - `localStorage` 상태 유지 및 비교 실행 시 백엔드 `POST /api/comparisons` 로그 저장 API 연동

2. Header UI (`front/src/components/Layout/Header.jsx`):
   - 헤더 우측 위시리스트 아이콘 옆에 `비교함` 버튼/아이콘 추가
   - 비교함에 담긴 개수를 보여주는 `CounterBadge` 연동
   - 비교함 클릭 시 비교 페이지 또는 모달로 이동

3. Wishlist DB 연동 (`front/src/hooks/useCart.js` 또는 `CartContext.jsx`):
   - 로그인 상태일 경우 백엔드 `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{food_id}`와 동기화
   - 카드 컴포넌트의 하트 버튼 클릭 시 DB 저장/삭제 즉시 반영 및 토스트 표시

4. MyPage (`front/src/pages/MyPage.jsx`):
   - [비교 히스토리] 탭 추가
   - `GET /api/comparisons`로 과거 비교 로그 목록을 불러와 카드 형태로 표기 (비교했던 상품 이미지/이름 리스트 및 비교 일시 출력)

기존 프로젝트 파일 구조 및 styled-components 컴포넌트 패턴을 준수하여 구현해줘.