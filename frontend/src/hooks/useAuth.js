import { useAuthStore } from "../store/authStore";
import AuthService from "../services/auth.services";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const data = await AuthService.login(username, password);
      setAuth(data.access_token, data.user);
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  const getUserRole = () => {
    return user ? (user.role || "USER") : "USER";
  };

  const isAdmin = () => {
    return getUserRole() === "ADMIN";
  };

  const isAnalyst = () => {
    const role = getUserRole();
    return role === "ANALYST" || role === "ADMIN";
  };

  return {
    token,
    user,
    isAuthenticated: token !== null,
    login,
    logout,
    getUserRole,
    isAdmin,
    isAnalyst
  };
}
