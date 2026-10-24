import { apiRequest } from './http';

export const foodApi = {
  recent: (limit = 5) => apiRequest(`/api/foods/recent?limit=${limit}`),
};
