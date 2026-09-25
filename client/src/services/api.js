import axios from "axios";

// ========================================
// CREATE AXIOS INSTANCE
// ========================================

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "cinebookToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error.response?.status === 401
    ) {
      console.error(
        "Authentication required."
      );
    }

    if (
      error.response?.status === 403
    ) {
      console.error(
        "Admin access required."
      );
    }

    return Promise.reject(error);
  }
);

export default api;