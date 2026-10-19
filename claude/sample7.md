백엔드/프론트엔드 전체 마이페이지(내 정보 및 취향 수정 + 위시리스트 관리) 기능을 구축해줘.

### 📋 1. 백엔드 (server/)

1. schemas/user_schema.py:
   - ProfileUpdateRequest: name(str), appliances(List[str]), preferences(List[str]), cooking_level(str)
2. models/user_model.py:
   - update_profile(session, user_id, data): users 테이블의 name, appliances, preferences, cooking_level 컬럼 UPDATE 및 저장
3. routes/auth_routes.py:
   - PUT /api/auth/me: 프로필 및 취향 정보 수정 API (수정 후 최신 UserResponse 반환)
   - GET /api/auth/me: 현재 로그인한 사용자 최신 정보 조회 API

---

### 🎨 2. 프론트엔드 (front/)

1. MyPage (`front/src/pages/MyPage.jsx` 또는 `MyPage/` 컴포넌트):
   - 상단 프로필 요약 카드: 이름, 요리 숙련도, 보유 주방기기/취향 칩 요약 출력
   - 탭 메뉴 구성을 통한 2가지 핵심 영역 제공:
     - [탭 1: 개인화 설정 (프로필 & 생활 환경 수정)]
       - 이름 수정 입력창
       - 보유 주방기기 칩 토글 선택
       - 선호 요리 스타일 칩 토글 선택
       - 요리 숙련도 라디오/칩 선택
       - "저장하기" 버튼 클릭 시 `PUT /api/auth/me` 호출 -> 성공 시 AuthContext 및 localStorage/Cookie 동기화 및 토스트 표시
     - [탭 2: 위시리스트 관리]
       - useCart / Wishlist 컨텍스트와 연동하여 찜한 상품 목록 카드 뷰 표기
       - 상품별 가격, 이미지, 주요 정보 카드 및 "삭제" 버튼 기능
       - 전체 삭제 또는 빈 상태 안내 UI

2. AuthContext 및 API 서비스 동기화:
   - 프로필 수정 완료 후 AuthContext 내 user 객체 최신화 및 localStorage.setItem('user_info', ...) 업데이트

기존 스타일 가이드(`*.styles.js` 또는 styled-components) 및 컴포넌트 구조를 준수하여 구현 코드를 완성해줘.