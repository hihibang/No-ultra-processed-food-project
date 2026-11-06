// 레시피 챗봇 전송 로직 (n8n 웹훅 경유)
// - OpenAI API 키는 프론트에 두지 않는다. 모든 요청은 n8n 웹훅으로만 보내고, 키는 n8n/.env 측에서 관리한다.
// - 1차 추천: RECIPE 웹훅 (취향 프로필 + 질문)
// - 후속 질문: FOLLOWUP 웹훅 (이전 대화 + 추천 레시피 맥락, RAG 미사용)

const RECIPE_WEBHOOK_URL = import.meta.env.VITE_N8N_RECIPE_WEBHOOK_URL;
const FOLLOWUP_WEBHOOK_URL = import.meta.env.VITE_N8N_FOLLOWUP_WEBHOOK_URL;

const REQUEST_TIMEOUT_MS = 60_000;
const HISTORY_LIMIT = 10;

export class ChatbotError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ChatbotError';
    this.status = status;
  }
}

// n8n 응답은 객체 또는 [객체] 형태일 수 있어 둘 다 처리한다.
const extractAnswer = (data) => {
  const item = Array.isArray(data) ? data[0] : data;
  const answer = item?.answer ?? item?.output ?? item?.text;
  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new ChatbotError('챗봇 응답 형식이 올바르지 않습니다.');
  }
  return answer;
};

async function postToWebhook(url, payload) {
  if (!url) {
    throw new ChatbotError('챗봇 서버 주소가 설정되지 않았습니다. (.env의 VITE_N8N_*_WEBHOOK_URL 확인)');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    throw new ChatbotError(
      error.name === 'AbortError'
        ? '응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
        : '챗봇 서버에 연결할 수 없습니다.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ChatbotError(`챗봇 서버 오류가 발생했습니다. (${response.status})`, response.status);
  }

  const data = await response.json().catch(() => null);
  return extractAnswer(data);
}

// 1차 레시피 추천
export function requestRecipe({ sessionId, question, profile }) {
  return postToWebhook(RECIPE_WEBHOOK_URL, {
    type: 'recipe',
    sessionId,
    question,
    profile: {
      cookingLevel: profile.cookingLevel,
      appliances: profile.appliances,
      preferences: profile.preferences,
      restrictions: profile.restrictions,
    },
    requestedAt: new Date().toISOString(),
  });
}

// 후속 질문 (RAG 미사용, 이전 맥락 전달)
export function requestFollowup({ sessionId, question, recipeContext, history }) {
  return postToWebhook(FOLLOWUP_WEBHOOK_URL, {
    type: 'followup',
    sessionId,
    question,
    useRag: false,
    recipeContext,
    history: history.slice(-HISTORY_LIMIT).map(({ role, content }) => ({ role, content })),
    requestedAt: new Date().toISOString(),
  });
}
