// 로그인 사용자의 대화 기록 API (chat_sessions). 비로그인 사용자는 호출하지 않는다.
import { apiRequest } from './http';

const sessionPath = (sessionId) => `/api/chat/sessions/${encodeURIComponent(sessionId)}`;

// 백엔드 ChatMessageItem 스키마와 맞춘다 (server/schemas/chat_session_schema.py)
// - kind는 'recipe' | 'followup'만 허용. 프론트 전용 kind(detail, exhausted)는 가장 가까운 값으로 바꾸거나 뺀다.
// - 스키마에 없는 필드와 null/undefined 값은 전송하지 않는다.
const ALLOWED_KINDS = ['recipe', 'followup'];
const KIND_FOR_SAVE = { detail: 'recipe' }; // 다른 레시피 답변은 추천 레시피로 저장한다
const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 8000;
const MAX_CANDIDATES = 10;

const toSaveKind = (message) => {
  const kind = KIND_FOR_SAVE[message.kind] ?? message.kind;
  // 사용자 메시지의 '다른 레시피' 요청 문구는 kind를 빼서 원래 질문 찾기에서 제외되게 한다
  return ALLOWED_KINDS.includes(kind) ? kind : undefined;
};

const toSaveCandidates = (candidates) => {
  if (!Array.isArray(candidates)) return undefined;
  const items = candidates
    .filter(c => typeof c?.content === 'string' && c.content.trim() !== '')
    .slice(0, MAX_CANDIDATES)
    .map(c => ({
      title: String(c.title ?? '').slice(0, MAX_TITLE_LENGTH) || '추천 레시피',
      content: c.content.slice(0, MAX_CONTENT_LENGTH),
    }));
  return items.length > 0 ? items : undefined;
};

export const sanitizeSessionMessages = (messages) =>
  messages.map(message => {
    const saved = {
      id: String(message.id),
      role: message.role,
      content: String(message.content ?? '').slice(0, MAX_CONTENT_LENGTH),
      kind: toSaveKind(message),
      createdAt: message.createdAt,
      candidates: toSaveCandidates(message.candidates),
      candidateIndex: Number.isInteger(message.candidateIndex) ? message.candidateIndex : undefined,
      savedLogId: Number.isInteger(message.savedLogId) ? message.savedLogId : undefined,
    };
    // undefined/null 값은 JSON에서 제외해 스키마 검증에 걸리지 않게 한다
    return Object.fromEntries(Object.entries(saved).filter(([, value]) => value !== undefined && value !== null));
  });

export const chatSessionApi = {
  list: () => apiRequest('/api/chat/sessions'),
  // 세션이 없으면 생성, 있으면 제목과 메시지 전체를 갱신
  save: (sessionId, { title, messages }) =>
    apiRequest(sessionPath(sessionId), {
      method: 'PUT',
      body: { title, messages: sanitizeSessionMessages(messages) },
    }),
  remove: (sessionId) => apiRequest(sessionPath(sessionId), { method: 'DELETE' }),
};
