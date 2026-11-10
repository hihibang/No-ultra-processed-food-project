// 레시피 챗봇 대화 상태 헬퍼 + 취향 프로필 localStorage 헬퍼
// - 대화 기록은 브라우저에 저장하지 않는다. 로그인 사용자는 서버(chat_sessions)에 저장하고, 비로그인 사용자는 화면 메모리에만 둔다.
// - 취향 프로필은 로그인 여부와 관계없이 브라우저에 저장한다 (대화 내용이 아니므로).
import { COOKING_LEVEL_OPTIONS } from '../constants/userOptions';

const LEGACY_SESSIONS_KEY = 'recipe_chat_sessions_v1';
const PROFILE_KEY = 'recipe_chat_profile_v1';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('프로필 저장에 실패했습니다.', error);
  }
};

// 이전 버전이 브라우저에 남겨 둔 대화 기록을 제거한다 (더 이상 브라우저에 대화를 남기지 않음)
export const clearLegacySessions = () => {
  try {
    localStorage.removeItem(LEGACY_SESSIONS_KEY);
  } catch {
    // 저장소 접근이 막혀 있으면 무시한다
  }
};

export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// 세션에 메시지를 추가하고 최신 대화를 맨 앞으로 옮긴다. 세션이 없으면 새로 만든다.
export const appendToSession = (sessions, sessionId, newMessages, now = new Date().toISOString()) => {
  const existing = sessions.find(s => s.id === sessionId);
  const base = existing ?? {
    id: sessionId,
    title: newMessages[0]?.content.slice(0, 30) ?? '새 대화',
    createdAt: now,
    messages: [],
  };
  const updated = { ...base, updatedAt: now, messages: [...base.messages, ...newMessages] };
  return [updated, ...sessions.filter(s => s.id !== sessionId)];
};

// 특정 메시지에 속성을 덧붙인다 (예: 마이페이지 저장 ID)
export const updateSessionMessage = (sessions, sessionId, messageId, patch) =>
  sessions.map(s => (s.id !== sessionId
    ? s
    : {
      ...s,
      messages: s.messages.map(m => (m.id === messageId ? { ...m, ...patch } : m)),
    }));

// 실패한 질문 메시지를 되돌린다. 메시지가 비면 세션도 제거한다.
export const dropMessageFromSession = (sessions, sessionId, messageId) =>
  sessions.flatMap(s => {
    if (s.id !== sessionId) return [s];
    const messages = s.messages.filter(m => m.id !== messageId);
    return messages.length === 0 ? [] : [{ ...s, messages }];
  });

export const loadChatProfile = () => readJson(PROFILE_KEY, null);

export const saveChatProfile = (profile) => writeJson(PROFILE_KEY, profile);

// 마이페이지 프로필(서버 응답 user)로부터 챗봇 취향 초기값 생성
export const buildProfileFromUser = (user, previous = {}) => ({
  cookingLevel: user?.cooking_level ?? COOKING_LEVEL_OPTIONS[0].value,
  appliances: user?.appliances ?? [],
  preferences: user?.preferences ?? [],
  restrictions: previous.restrictions ?? '',
});
