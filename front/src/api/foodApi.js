import { apiRequest } from './http';

export const foodApi = {
  recent: (limit = 5) => apiRequest(`/api/foods/recent?limit=${limit}`),
  // 상품 상세 페이지: 성분표·원재료·건강 점수 분석
  detail: (reportNo) => apiRequest(`/api/foods/${encodeURIComponent(String(reportNo))}`),
};
