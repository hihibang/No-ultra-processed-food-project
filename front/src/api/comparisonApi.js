import { apiRequest } from './http';

export const comparisonApi = {
  list: () => apiRequest('/api/comparisons'),
  detail: (comparisonId) => apiRequest(`/api/comparisons/${comparisonId}`),
  create: (productIds) => apiRequest('/api/comparisons', { method: 'POST', body: { product_ids: productIds } }),
};
