import API from "./api";

const AuthService = {
  login: async (username, password) => {
    const response = await API.post("/api/auth/login", { username, password });
    return response.data;
  },

  register: async (email, password) => {
    const response = await API.post("/api/auth/register", { email, password });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await API.post("/api/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, new_password) => {
    const response = await API.post("/api/auth/reset-password", { token, new_password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get("/api/user/me");
    return response.data;
  }
};

export default AuthService;
