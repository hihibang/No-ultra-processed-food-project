// n8n Code 노드 — Format Context (1차 레시피 추천 전용)
// 모드: Run Once for All Items  (코드가 $input.all()을 쓰므로 노드 설정의 Mode도 반드시 All Items로 맞춘다)
// 입력: Webhook / 이전 노드 출력 ({ type, sessionId, question 또는 query, profile, recipes, ... })
// 출력: 기존 필드 유지 + question + profile(검증본) + userPrompt(프로필 블록 포함 최종 프롬프트)

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

const sanitizeText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const pickAllowed = (value, allowed) => {
  if (!Array.isArray(value)) return [];
  const picked = value.filter(v => typeof v === 'string' && allowed.includes(v));
  return [...new Set(picked)];
};

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

// 체크하지 않은 도구는 보유하지 않은 것으로 본다. 아무것도 체크하지 않았으면 제한하지 않는다.
const STOVE_APPLIANCES = ['인덕션', '가스레인지'];
const splitAppliances = (profile) => ({
  usable: profile.appliances,
  unusable: profile.appliances.length > 0 ? APPLIANCE_OPTIONS.filter(a => !profile.appliances.includes(a)) : [],
});
const hasStove = (profile) => profile.appliances.length === 0 || profile.appliances.some(a => STOVE_APPLIANCES.includes(a));

const buildProfileBlock = (profile) => {
  const { usable, unusable } = splitAppliances(profile);
  const applianceLines = usable.length > 0
    ? [
      `2. 사용 가능한 주방 도구 (이것만 사용): ${usable.join(', ')}`,
      `   사용 불가 주방 도구 (보유하지 않음, 절대 사용 금지): ${listOrNone(unusable)}`,
    ]
    : ['2. 보유 주방 도구: 지정 안 함'];
  return [
    '[사용자 취향 프로필]',
    `1. 식이 제한 · 현재 상황 (반드시 준수): ${profile.restrictions || '없음'}`,
    ...applianceLines,
    `3. 요리 숙련도: ${profile.cookingLevelLabel}`,
    `   선호 요리: ${listOrNone(profile.preferences)}`,
  ].join('\n');
};

const buildApplianceRules = (profile) => {
  const { usable, unusable } = splitAppliances(profile);
  if (usable.length === 0) return [];
  const rules = [
    `- 사용 가능한 조리도구는 ${usable.join(', ')} 뿐입니다. 이 도구만으로 완성되는 레시피만 제안하세요.`,
    `- 사용 불가 도구(${unusable.join(', ')})는 보유하지 않은 것입니다. 재료 손질·조리 단계 어디에도 쓰지 마세요.`,
  ];
  if (!hasStove(profile)) {
    rules.push(
      '- 불을 쓰는 조리(팬 굽기·볶기·끓이기·튀기기·삶기, 냄비·프라이팬·인덕션·가스레인지 사용)는 절대 제안하지 마세요. '
      + (usable.includes('전자레인지') ? '전자레인지 전용 용기·머그컵·찜기로 완성되는 조리법만 쓰세요. ' : '')
      + '사용자가 요청한 메뉴명(예: 김치볶음밥)을 절대 다른 요리로 바꾸지 말고, 요청한 그 메뉴를 사용 가능한 도구만으로 만드는 레시피로 작성하세요.',
    );
  }
  return rules;
};

const formatRetrievedRecipes = (recipes) => {
  if (!Array.isArray(recipes) || recipes.length === 0) return '';
  const items = recipes
    .slice(0, 3)
    .map((r, idx) => r?.payload?.pageContent ? `[참고 레시피 ${idx + 1}]\n${r.payload.pageContent}` : '')
    .filter(Boolean);
  return items.length > 0
    ? ['[참고 레시피 데이터 (사용 불가 도구 단계는 사용 가능 도구 조리법으로 변형할 것)]', ...items, ''].join('\n')
    : '';
};

const buildUserPrompt = (question, profile, recipes) => [
  ...(profile ? [buildProfileBlock(profile), ''] : []),
  ...(recipes ? [formatRetrievedRecipes(recipes)] : []),
  '[사용자 질문]',
  question,
  '',
  '[작성 지침]',
  '- 반드시 [사용자 질문]에서 요청한 메뉴 그 자체의 레시피를 작성하세요. 다른 요리로 바꾸지 마세요.',
  '- 식이 제한 및 알레르기 재료는 대체 재료를 포함해 절대 사용하지 마세요.',
  ...(profile && profile.appliances.length > 0
    ? ['- 체크하지 않은 주방 도구는 보유하지 않은 것입니다. 쓰지 말고, 사용 가능한 도구로 가능한 조리법만 제안하세요.']
    : []),
  ...(profile ? buildApplianceRules(profile) : []),
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
  const body = json.body && typeof json.body === 'object' ? json.body : json;

  const question = sanitizeText(body.question ?? body.query, QUESTION_MAX_LENGTH);
  const hasProfile = body.profile !== null && typeof body.profile === 'object' && !Array.isArray(body.profile);
  const profile = hasProfile ? extractProfile(body.profile) : null;

  return {
    json: {
      ...json,
      type: body.type ?? 'recipe',
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
      question,
      profile,
      userPrompt: buildUserPrompt(question, profile, body.recipes),
    },
  };
});