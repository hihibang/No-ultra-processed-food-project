// 레시피 챗봇 전송 로직
// - 1차 레시피 추천/벡터 검색: n8n 웹훅 (취향 프로필 + 질문) → { answer, candidates }
// - 후속 질문: 로컬 백엔드 POST /api/chat/followup (OpenAI 직접 호출, RAG 미사용, 로그인 필요)
// - OpenAI API 키는 프론트에 두지 않는다. 키는 서버(server/.env)와 n8n 측에서만 관리한다.
import { apiRequest } from './http';

const RECIPE_WEBHOOK_URL = import.meta.env.VITE_N8N_RECIPE_WEBHOOK_URL;

const REQUEST_TIMEOUT_MS = 60_000;
const HISTORY_LIMIT = 10;

export class ChatbotError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ChatbotError';
    this.status = status;
  }
}

// n8n 응답 정규화
// - candidates: 직전 벡터 검색으로 얻은 추천 후보 목록 (없으면 빈 배열)
// - answer: 후보가 있으면 candidates[0]을 사용해 화면과 후보 목록이 어긋나지 않게 한다
const extractRecipeResult = (data) => {
  const item = Array.isArray(data) ? data[0] : data;

  const candidates = Array.isArray(item?.candidates)
    ? item.candidates
      .map((c, i) => ({
        title: typeof c?.title === 'string' && c.title.trim() ? c.title.trim() : `후보 ${i + 1}`,
        content: c?.answer ?? c?.content ?? c?.text,
      }))
      .filter(c => typeof c.content === 'string' && c.content.trim() !== '')
    : [];

  const answer = candidates.length > 0
    ? candidates[0].content
    : item?.answer ?? item?.output ?? item?.text;

  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new ChatbotError('챗봇 응답 형식이 올바르지 않습니다.');
  }
  return { answer, candidates };
};

async function postToRecipeWebhook(payload) {
  if (!RECIPE_WEBHOOK_URL) {
    throw new ChatbotError('챗봇 서버 주소가 설정되지 않았습니다. (.env의 VITE_N8N_RECIPE_WEBHOOK_URL 확인)');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(RECIPE_WEBHOOK_URL, {
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
  return extractRecipeResult(data);
}

// 1차 레시피 추천 (n8n 벡터 검색 워크플로우)
export function requestRecipe({ sessionId, question, profile }) {
  return postToRecipeWebhook({
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

// 후속 질문 (로컬 백엔드 → OpenAI). 이전 대화 히스토리와 추천 레시피 맥락을 함께 보낸다.
export async function requestFollowup({ sessionId, question, recipeContext, history, profile }) {
  if (!localStorage.getItem('access_token')) {
    throw new ChatbotError('후속 질문은 로그인 후 이용할 수 있습니다.', 401);
  }

  const data = await apiRequest('/api/chat/followup', {
    method: 'POST',
    body: {
      sessionId,
      question,
      recipeContext,
      history: history.slice(-HISTORY_LIMIT).map(({ role, content }) => ({ role, content })),
      profile: profile
        ? {
          cookingLevel: profile.cookingLevel,
          appliances: profile.appliances,
          preferences: profile.preferences,
          restrictions: profile.restrictions,
        }
        : null,
    },
  });

  if (typeof data?.answer !== 'string' || data.answer.trim() === '') {
    throw new ChatbotError('챗봇 응답 형식이 올바르지 않습니다.');
  }
  return { answer: data.answer, candidates: [] };
}
