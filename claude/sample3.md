React(`react-router-dom`) + styled-components 환경에서 사용할 **"푸드 저널 & 식단 이야기(매거진형 스토리)"** 기능을 만드는 작업계획을 .md 파일로 만들어줘

### 1. 동작 방식
- **메인 섹션 (`FoodJournalSection.jsx`)**:
  - 초록색 히어로 배너와 카테고리 쇼핑 사이에 배치.
  - 최신 스토리 카드 3개가 가로 그리드로 노출.
  - **"전체 이야기 보기 →" 버튼을 누르면 `navigate('/journal')`을 통해 전체 저널 목록 페이지로 라우팅 이동.**
  - 개별 카드를 클릭해도 해당 스토리 상세 경로(`/journal/:id`) 또는 전체 페이지로 이동.

- **전체 이야기 전용 페이지 (`JournalPage.jsx`)**:
  - `/journal` 라우트에 연결될 독립된 전체 페이지 컴포넌트.
  - 상단에 뒤로가기/홈으로 가기 버튼, 검색창/카테고리 필터 탭(전체, 식재료 이야기, 오늘 루틴 등).
  - 6~8개 이상의 풍부한 저널 카드 그리드 목록 노출.
  - 카드 클릭 시 본문 내용을 편하게 읽을 수 있는 상세 모달 또는 뷰 연결.

### 2. 카드 UI 구성
- 썸네일 이미지 + 카테고리 태그 칩 ('식재료 이야기', '오늘의 루틴', '성분 탐구' 등)
- 읽는 시간 (예: "2분 읽기")
- 제목 & 2줄 요약 프리뷰
- 하단 '연관 추천 상품' 미니 칩 (예: "관련 제품: 자연숙성 유기농 저염간장")
- 호버 시 부드러운 카드 리프트 인터랙션

### 3. 디자인 톤앤매너
- 기존 서비스 톤에 맞춘 클린 & 헬시 스타일 (포인트 컬러: 딥 그린 `#15803d`, 라운드 `16px`, 모바일 1열 반응형)
- 초가공식품 줄이기, 유기농 간장, 저염 식단 등 건강식 테마의 목데이터 포함

메인에 들어갈 `FoodJournalSection.jsx`와 전체 페이지인 `JournalPage.jsx`, 그리고 `App.jsx`에서 라우터 연결하는 방법까지 깔끔하게 작성해줘.

## 4. 개요
* **목적**: 커머스 메인 화면에 단순 상품 나열을 넘어 초가공식품(UPF) 저감 및 건강한 식문화 스토리를 전달하는 매거진형 큐레이션 영역 신설.
* **기술 스택**: React (v18+), `react-router-dom` (v6), `styled-components`.
* **화면 흐름**:
  * 메인 홈(`HomePage`): 히어로 배너와 카테고리 쇼핑 사이에 3열 카드 섹션 노출.
  * 진입 트리거: '전체 이야기 보기 →' 클릭 또는 개별 카드 클릭 시 전용 페이지(`/journal`)로 이동.
  * 전체 저널 페이지(`JournalPage.jsx`): 카테고리 필터링 탭, 검색, 다중 그리드 카드 노출 및 상세 읽기 모달 연계.

---

## 5. 디렉토리 구조 설계

src/
├── data/
│   └── journalMockData.js           # 저널 목데이터 (공통 참조)
├── components/
│   ├── Journal/
│   │   ├── FoodJournalSection.jsx   # 메인 홈용 저널 요약 섹션 (3열)
│   │   ├── FoodJournalSection.styles.js
│   │   ├── JournalCard.jsx          # 공통 저널 카드 컴포넌트
│   │   ├── JournalCard.styles.js
│   │   ├── JournalDetailModal.jsx   # 본문 상세 읽기 모달
│   │   └── JournalDetailModal.styles.js
├── pages/
│   ├── HomePage.jsx                 # 메인 페이지 (FoodJournalSection 삽입)
│   └── JournalPage.jsx              # 전체 이야기 전용 독립 페이지 (/journal)
└── App.jsx                          # 라우터 등록

참고 이미지: img 폴더 안에 이야기.png. 참조