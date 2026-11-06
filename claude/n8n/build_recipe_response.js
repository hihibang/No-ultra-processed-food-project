// n8n Code 노드 — Build Recipe Response (Respond to Webhook 직전)
// 모드: Run Once for All Items
// 입력: 후보 레시피 아이템들 (LLM 노드가 후보마다 생성한 결과). 각 아이템 json 예:
//       { title: '두부 버섯 조림', answer: '### 재료\n- **두부** 1모 ...' }   (text 키도 허용)
// 출력: 프론트 chatbotApi.js가 읽는 응답 { answer, candidates }
//       - candidates[0]이 기본 화면에 보이는 레시피, 나머지는 퀵 액션 ②("n번 레시피 보기")에서 사용
//       - 추가 벡터 검색 없이 이 목록을 그대로 재사용한다
// 후보 수는 최대 3개로 제한한다.

const MAX_CANDIDATES = 3;

const toCandidate = (json, index) => {
  const answer = json.answer ?? json.text ?? json.output;
  if (typeof answer !== 'string' || answer.trim() === '') return null;
  const title = typeof json.title === 'string' && json.title.trim() ? json.title.trim() : `후보 ${index + 1}`;
  return { title, answer: answer.trim() };
};

const candidates = $input.all()
  .map(({ json }, index) => toCandidate(json, index))
  .filter(Boolean)
  .slice(0, MAX_CANDIDATES);

if (candidates.length === 0) {
  throw new Error('추천 레시피 후보가 없습니다. 검색 결과와 LLM 노드 출력을 확인하세요.');
}

return [{
  json: {
    // 기본 표시 레시피 = 첫 번째 후보 (프론트도 candidates[0]을 우선 사용한다)
    answer: candidates[0].answer,
    candidates,
  },
}];
