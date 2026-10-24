백엔드의 계층형 레이어 아키텍처(schemas, models, routes)에 맞춰 인증(Auth) 모듈을 구축하고, 프론트엔드 SignUpModal 연동을 완료해줘. (이미 DB DDL은 실행 완료되었으므로 데이터베이스에 `users` 테이블이 존재하는 상태임)

### 1. 백엔드 인증 모듈 구축 (기존 아키텍처 및 폴더 구조 준수)

- schemas (요청/응답 데이터 검증 셰마)
  - UserSignUpRequest: email, password, name, appliances (List[str] / Array), preferences (List[str] / Array), cooking_level (str)
  - UserLoginRequest: email, password
  - UserResponse / TokenResponse: 성공 시 반환할 유저 데이터/토큰 구조

- models (DB 쿼리/ORM 연동)
  - users 테이블과 매핑되는 CRUD 및 인증 비즈니스 로직 작성
  - 회원가입 INSERT (비밀번호 암호화 저장, appliances 및 preferences JSON 파싱/직렬화 처리)
  - 이메일 중복 체크 SELECT 및 로그인 비밀번호 검증 함수 구현

- routes (엔드포인트 라우팅)
  - POST /api/auth/signup: 2단계 폼 데이터 수신, 중복 체크 후 회원가입 처리
  - POST /api/auth/login: 로그인 인증 처리
  - 서버 메인 파일(main.py 또는 app.js/index.js)에 auth 라우터를 `/api/auth` 경로로 등록

### 2. 프론트엔드 연동 (SignUpModal.jsx)

- SignUpModal 컴포넌트를 2단계(Multi-step) 폼으로 구축:
  - Step 1: 이름, 이메일, 비밀번호, 비밀번호 확인, 약관동의 -> 유효성 검사 후 "다음" 버튼으로 Step 2 이동
  - Step 2: 보유 주방기기(전자레인지, 에어프라이어, 인덕션 등) 및 선호 요리 스타일 칩 토글 선택 -> "← 이전" 버튼 및 "회원가입 완료" 버튼 배치
- Step 2에서 "회원가입 완료" 클릭 시 `POST /api/auth/signup` API 호출
- 회원가입 성공 시 성공 토스트/알림 표시, 모달 닫기 및 로그인 모달 전환 로직 연결
- 에러 발생 시 사용자 친화적인 에러 메시지(예: 이미 가입된 이메일) 처리

위 프로젝트 구조를 분석하여 관련 파일들을 생성 및 업데이트하고 연동 코드를 완성해줘.