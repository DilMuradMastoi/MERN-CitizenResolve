import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civic_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  login: (data) => api.post("/auth/login", data),
  signup: (data) => api.post("/auth/signup", data)
};

export const complaints = {
  list: (params = {}) => api.get("/complaints", { params }),
  mine: () => api.get("/complaints/mine"),
  get: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post("/complaints", data),
  upvote: (id) => api.patch(`/complaints/${id}/upvote`),
  status: (id, data) => api.patch(`/complaints/${id}/status`, data),
  feedback: (id, data) => api.patch(`/complaints/${id}/feedback`, data),
  exportCsv: () => api.get("/complaints/export", { responseType: "blob" })
};

export const ai = {
  officerSummary: () => api.post("/ai/officer-summary")
};

export default api;