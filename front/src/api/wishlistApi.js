import { apiRequest } from './http';

export const wishlistApi = {
  list: () => apiRequest('/api/wishlist'),
  add: (foodId) => apiRequest('/api/wishlist', { method: 'POST', body: { food_id: foodId } }),
  remove: (foodId) => apiRequest(`/api/wishlist/${encodeURIComponent(foodId)}`, { method: 'DELETE' }),
};
