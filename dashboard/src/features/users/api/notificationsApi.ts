import api from "../../../config/api";

export interface NotificationDto {
  id: string;
  message: string;
  type: "Info" | "Warning" | "Critical";
  createdAt: string;
  isPushed: boolean;
  isRead: boolean;
}

export class NotificationsApi {
  static async getUnpushed(): Promise<NotificationDto[]> {
    try {
      const res = await api.get<{ data: NotificationDto[] }>("/notifications/unpushed");
      return res.data?.data ?? [];
    } catch (e) {
      console.error("Error fetching unpushed notifications:", e);
      return [];
    }
  }

  static async markAsPushed(notificationIds: string[]): Promise<boolean> {
    if (notificationIds.length === 0) return true;
    try {
      await api.put("/notifications/pushed", notificationIds);
      return true;
    } catch (e) {
      console.error("Error marking notifications as pushed:", e);
      return false;
    }
  }
}
