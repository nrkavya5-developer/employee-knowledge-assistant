import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: (data: { email: string; password: string; full_name: string; department?: string }) =>
    api.post<TokenResponse>("/api/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>("/api/auth/login", data).then((r) => r.data),
  me: () => api.get<User>("/api/auth/me").then((r) => r.data),
};

export default api;
