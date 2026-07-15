import { create } from "zustand";
import AdminService from "../services/admin.service";

export const useAlertStore = create((set, get) => ({
  notifications: [],
  activeBannerAlert: null,
  loading: false,

  fetchNotifications: async () => {
    try {
      const notifs = await AdminService.getInAppNotifications();
      set({ notifications: notifs });
      const unread = notifs.filter((n) => !n.read);
      if (unread.length > 0) {
        set({ activeBannerAlert: unread[0] });
      } else {
        set({ activeBannerAlert: null });
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  },

  dismissBanner: async () => {
    const active = get().activeBannerAlert;
    if (!active) return;
    try {
      await AdminService.markNotificationRead(active.id);
      set({ activeBannerAlert: null });
      await get().fetchNotifications();
    } catch (e) {
      set({ activeBannerAlert: null });
    }
  }
}));
