import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },

  getUserRole: () => {
    return get().user ? (get().user.role || "USER") : "USER";
  },

  isAdmin: () => {
    return get().getUserRole() === "ADMIN";
  },

  isAnalyst: () => {
    const role = get().getUserRole();
    return role === "ANALYST" || role === "ADMIN";
  }
}));
