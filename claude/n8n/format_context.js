// n8n Code 노드 — Format Context (1차 레시피 추천 전용)
// 모드: Run Once for Each Item
// 입력: Webhook 노드 출력 (프론트 chatbotApi.js의 recipe 요청: { type, sessionId, question, profile, ... })
// 출력: 기존 필드 유지 + profile(검증본) + userPrompt(프로필 블록 포함 최종 프롬프트)
//
// 역할 분리: 이 워크플로우는 초기 레시피 검색·추천만 담당한다.
// 후속 질문(type: 'followup')은 로컬 백엔드(/api/chat/followup)가 OpenAI로 직접 처리하므로 여기서 다루지 않는다.
//
// 프로필 블록 우선순위 (안전 최우선): 1) 식이 제한 · 현재 상황 2) 보유 주방 도구 3) 요리 숙련도 · 선호 요리
// ※ server/utils/chat_profile.py의 build_profile_block과 같은 순서를 유지한다.

// 프론트 userOptions.js와 동일한 허용 목록 (목록 밖 값은 버린다)
const COOKING_LEVEL_LABELS = {
  beginner: '초보',
  intermediate: '중급',
  advanced: '고수',
};
const APPLIANCE_OPTIONS = ['전자레인지', '에어프라이어', '인덕션', '가스레인지', '오븐', '믹서기'];
const PREFERENCE_OPTIONS = ['한식', '양식', '중식', '일식', '베이킹', '건강식'];

const RESTRICTIONS_MAX_LENGTH = 200;
const QUESTION_MAX_LENGTH = 1000;

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// 문자열 정제: 제어문자/줄바꿈 제거, 공백 정리, 길이 제한
const sanitizeText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

// 배열 정제: 문자열이며 허용 목록에 있는 값만 중복 없이 유지
const pickAllowed = (value, allowed) => {
  if (!Array.isArray(value)) return [];
  const picked = value.filter(v => typeof v === 'string' && allowed.includes(v));
  return [...new Set(picked)];
};

// 프론트 profile 객체 추출 및 검증 (잘못된 값은 안전한 기본값으로 대체)
const extractProfile = (raw) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};

  const cookingLevel = typeof source.cookingLevel === 'string' && hasOwn(COOKING_LEVEL_LABELS, source.cookingLevel)
    ? source.cookingLevel
    : 'beginner';

  return {
    cookingLevel,
    cookingLevelLabel: COOKING_LEVEL_LABELS[cookingLevel],
    appliances: pickAllowed(source.appliances, APPLIANCE_OPTIONS),
    preferences: pickAllowed(source.preferences, PREFERENCE_OPTIONS),
    restrictions: sanitizeText(source.restrictions, RESTRICTIONS_MAX_LENGTH),
  };
};

const listOrNone = (items) => (items.length > 0 ? items.join(', ') : '없음');

// 우선순위 순서: 식이 제한 → 보유 주방 도구 → 요리 숙련도 · 선호 요리
const buildProfileBlock = (profile) => [
  '[사용자 취향 프로필]',
  `1. 식이 제한 · 현재 상황 (반드시 준수): ${profile.restrictions || '없음'}`,
  `2. 보유 주방 도구: ${listOrNone(profile.appliances)}`,
  `3. 요리 숙련도: ${profile.cookingLevelLabel}`,
  `   선호 요리: ${listOrNone(profile.preferences)}`,
].join('\n');

const buildUserPrompt = (question, profile) => [
  ...(profile ? [buildProfileBlock(profile), ''] : []),
  '[사용자 질문]',
  question,
  '',
  '[작성 지침]',
  '- 식이 제한 및 알레르기 재료는 대체 재료를 포함해 절대 사용하지 마세요.',
  '- 보유하지 않은 주방 도구는 쓰지 말고, 보유 도구로 가능한 조리법을 우선하세요.',
  '- 선호 요리 카테고리가 있으면 그 범위 안에서 추천하세요.',
  '- 요리 숙련도에 맞춰 설명의 상세도를 조절하세요.',
  '',
  '[답변 형식 - 마크다운]',
  '- 제목은 `### 요리 이름`, 섹션은 `### 재료`, `### 조리 순서`, `### 팁`으로 구분하세요.',
  '- 재료는 불릿(`- `)으로 쓰고, 분량은 **굵게** 강조하세요.',
  '- 조리 순서는 번호 목록(`1. `)으로 한 단계씩 쓰세요.',
  '- 불 세기, 시간, 양념 분량 같은 핵심 수치는 **굵게** 표시하세요.',
  '- 불필요한 서론과 인사말은 생략하세요.',
].join('\n');

return $input.all().map(({ json }) => {
  // Webhook 노드는 본문을 json.body 아래에 둔다. 없으면 json 자체를 본문으로 본다.
  const body = json.body && typeof json.body === 'object' ? json.body : json;

  const question = sanitizeText(body.question, QUESTION_MAX_LENGTH);
  const hasProfile = body.profile !== null && typeof body.profile === 'object' && !Array.isArray(body.profile);
  const profile = hasProfile ? extractProfile(body.profile) : null;

  return {
    json: {
      ...json,
      type: body.type ?? 'recipe',
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
      question,
      profile,
      userPrompt: buildUserPrompt(question, profile),
    },
  };
});
