const API_BASE = '/api';

export const apiClient = async (endpoint, options = {}) => {
  let token = null;
  try {
    token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('bugarena_token') : null;
  } catch (e) {}
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (data.details && data.details.join(', ')) || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// API Services
export const authApi = {
  register: (payload) => apiClient('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiClient('/auth/me'),
  updateProfile: (payload) => apiClient('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) })
};

export const challengesApi = {
  getAll: () => apiClient('/challenges'),
  getById: (challengeId) => apiClient(`/challenges/${challengeId}`),
  unlockHint: (challengeId, tier) => apiClient(`/challenges/${challengeId}/hint`, { method: 'POST', body: JSON.stringify({ tier }) }),
  recordAttempt: (challengeId) => apiClient(`/challenges/${challengeId}/attempt`, { method: 'POST' })
};

export const reportsApi = {
  submit: (payload) => apiClient('/reports', { method: 'POST', body: JSON.stringify(payload) }),
  getMyReports: (status) => apiClient(`/reports/my${status ? `?status=${status}` : ''}`),
  getById: (id) => apiClient(`/reports/${id}`)
};

export const leaderboardApi = {
  getLeaderboard: (page = 1, limit = 50) => apiClient(`/leaderboard?page=${page}&limit=${limit}`),
  getStats: () => apiClient('/leaderboard/stats')
};

export const profileApi = {
  getMyProfile: () => apiClient('/profile/me'),
  getByUsername: (username) => apiClient(`/profile/${username}`)
};

export const adminApi = {
  getStats: () => apiClient('/admin/stats'),
  getReports: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiClient(`/admin/reports${params ? `?${params}` : ''}`);
  },
  reviewReport: (id, payload) => apiClient(`/admin/reports/${id}/review`, { method: 'PUT', body: JSON.stringify(payload) })
};

export const assistantApi = {
  chat: (payload) => apiClient('/assistant/chat', { method: 'POST', body: JSON.stringify(payload) })
};
