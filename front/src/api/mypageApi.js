// 마이페이지 통합 로그 API (mypage_logs). 현재는 레시피 보관함(log_type = 'recipe')만 사용한다.
import { apiRequest } from './http';

export const mypageApi = {
  listRecipes: () => apiRequest('/api/mypage/logs?log_type=recipe'),
  saveRecipe: ({ title, content }) =>
    apiRequest('/api/mypage/logs', { method: 'POST', body: { log_type: 'recipe', title, content } }),
  removeLog: (logId) => apiRequest(`/api/mypage/logs/${logId}`, { method: 'DELETE' }),
};
