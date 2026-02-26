import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalReq = error.config;

        if (originalReq === "/auth/refresh") {
            return Promise.reject(error);
        }
    
        if (error.response?.status === 401 && !originalReq._retry) {
            originalReq._retry = true;

            try {
                await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );
                return api(originalReq);
            } catch (refreshError) {
                console.error("Refresh token expired");
                localStorage.removeItem("user");
                const currentPath = window.location.pathname;
                if (currentPath !== "/login" && currentPath !== "/signup") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)

export default api;