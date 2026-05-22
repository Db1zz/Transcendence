import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;

    if (originalReq.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      try {
        await api.post("/auth/refresh", {});
        return api(originalReq);
      } catch (refreshError) {
        console.error("Refresh token expired");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;