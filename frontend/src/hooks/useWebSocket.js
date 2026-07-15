import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAlertStore } from "../store/alertStore";

export function useWebSocket() {
  const token = useAuthStore((state) => state.token);
  const fetchNotifications = useAlertStore((state) => state.fetchNotifications);

  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 12000);

    return () => clearInterval(interval);
  }, [token, fetchNotifications]);
}
