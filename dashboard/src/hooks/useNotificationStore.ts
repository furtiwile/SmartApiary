import { create } from "zustand";
import type { NotificationPayload } from "../components/ui/Toast";

interface NotificationStore {
  notifications: NotificationPayload[];
  unreadCount: number;
  addNotification: (n: NotificationPayload) => void;
  markAllRead: () => void;
  clear: () => void;
}

/**
 * Global zustand store for notification history.
 * Keeps the last 50 notifications.
 */
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () => set({ unreadCount: 0 }),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
