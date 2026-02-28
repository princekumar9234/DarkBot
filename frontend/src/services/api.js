import axios from 'axios';

// All API calls go through Vite proxy (/api → http://localhost:3000)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ─── Auth ────────────────────────────────────────────
export const authService = {
  signup: (d)  => api.post('/auth/signup', d),
  login:  (d)  => api.post('/auth/login',  d),
  logout: ()   => api.post('/auth/logout'),
};

// ─── Chat ────────────────────────────────────────────
export const chatService = {
  sendMessage: (formData) =>
    api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory:  ()       => api.get('/chat/history'),
  getChat:     (id)     => api.get(`/chat/${id}`),
  deleteChat:  (id)     => api.delete(`/chat/${id}`),
  clearAll:    ()       => api.delete('/chat/clear/all'),
};

// ─── User ────────────────────────────────────────────
export const userService = {
  getProfile:      ()  => api.get('/user/profile'),
  updateProfile:   (d) => api.put('/user/profile', d),
  changePassword:  (d) => api.put('/user/password', d),
  updatePrefs:     (d) => api.put('/user/preferences', d),
};

export default api;
