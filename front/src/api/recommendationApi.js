// 협업 필터링 추천 API 클라이언트 (백엔드 routes/recommendation_routes.py 와 계약을 맞춘다)
import { apiRequest } from './http';

export const recommendationApi = {
  // ① 레시피 맞춤 상품 (비로그인도 콘텐츠 기준으로 응답)
  recipeProducts: ({ recipeTitle, ingredients }) =>
    apiRequest('/api/recommendations/recipe-products', {
      method: 'POST',
      body: { recipe_title: recipeTitle, ingredients },
    }),
  // ② 취향이 비슷한 유저가 저장한 레시피 (로그인 필요)
  similarUserRecipes: () => apiRequest('/api/recommendations/similar-users/recipes'),
  // ③ 팬덤 Cross-Domain 추천
  crossDomain: ({ targetType, targetId }) =>
    apiRequest(`/api/recommendations/cross-domain?target_type=${encodeURIComponent(targetType)}&target_id=${encodeURIComponent(targetId)}`),
  // ④ 스마트 상품 비교
  compareProduct: (productId) =>
    apiRequest(`/api/recommendations/products/${encodeURIComponent(productId)}/compare`),
  // ⑤ 인플루언서 검수 레시피 후보 (레시피 답변 맥락에서만 호출, 비로그인은 빈 목록)
  influencerRecipes: ({ limit = 2 } = {}) =>
    apiRequest(`/api/recommendations/influencer-recipes?limit=${limit}`),
  influencerRecipeDetail: (recipeId) =>
    apiRequest(`/api/recommendations/influencer-recipes/${encodeURIComponent(String(recipeId))}`),
  // ⑥ /influencers 페이지: 크리에이터 목록(찜 여부·팬덤 점수), 찜 토글, 검수 레시피 목록
  influencers: () => apiRequest('/api/recommendations/influencers'),
  influencerRecipes: (creatorId) => apiRequest(
    creatorId
      ? `/api/recommendations/influencers/recipes?creator_id=${encodeURIComponent(creatorId)}`
      : '/api/recommendations/influencers/recipes',
  ),
  followInfluencer: (creatorId) =>
    apiRequest(`/api/recommendations/influencers/${encodeURIComponent(creatorId)}/follow`, { method: 'POST' }),
  unfollowInfluencer: (creatorId) =>
    apiRequest(`/api/recommendations/influencers/${encodeURIComponent(creatorId)}/follow`, { method: 'DELETE' }),
};

// 행동 로그 기록 (찜/비교/저장/클릭). 로그인 상태에서만 보내며, 실패해도 화면 동작에는 영향을 주지 않는다.
export const logInteraction = ({ itemType, itemId, action, label }) => {
  if (!localStorage.getItem('access_token') || itemId === undefined || itemId === null || itemId === '') return;
  apiRequest('/api/recommendations/interactions', {
    method: 'POST',
    body: {
      item_type: itemType,
      item_id: String(itemId),
      action,
      ...(label ? { label: String(label).slice(0, 255) } : {}),
    },
  }).catch(() => {});
};
