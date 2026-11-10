// 로그인 사용자의 대화 기록 API (chat_sessions). 비로그인 사용자는 호출하지 않는다.
import { apiRequest } from './http';

const sessionPath = (sessionId) => `/api/chat/sessions/${encodeURIComponent(sessionId)}`;

export const chatSessionApi = {
  list: () => apiRequest('/api/chat/sessions'),
  // 세션이 없으면 생성, 있으면 제목과 메시지 전체를 갱신
  save: (sessionId, { title, messages }) =>
    apiRequest(sessionPath(sessionId), { method: 'PUT', body: { title, messages } }),
  remove: (sessionId) => apiRequest(sessionPath(sessionId), { method: 'DELETE' }),
};
