import { useCallback } from "react";
import toast from "react-hot-toast";
import { RichToast, type NotificationPayload, type NotificationType } from "../components/ui/Toast";
import { useNotificationStore } from "./useNotificationStore";

interface NotifyOptions {
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Central hook for triggering rich, animated toast notifications.
 * Simultaneously persists all notifications to the global history store
 * so they appear in the NotificationDrawer.
 */
export function useNotify() {
  const { addNotification } = useNotificationStore();

  const notify = useCallback(
    ({ title, message, type, duration = 5000, action }: NotifyOptions) => {
      const payload: NotificationPayload = {
        id: crypto.randomUUID(),
        type,
        title,
        message,
        timestamp: new Date(),
        action,
      };

      // Persist to drawer history
      addNotification(payload);

      // Show animated toast
      toast.custom(
        (t) => (
          <RichToast
            notification={payload}
            onDismiss={() => toast.dismiss(t.id)}
            visible={t.visible}
          />
        ),
        { duration, id: payload.id }
      );
    },
    [addNotification]
  );

  const success = useCallback(
    (title: string, message: string, opts?: Partial<NotifyOptions>) =>
      notify({ title, message, type: "success", ...opts }),
    [notify]
  );

  const error = useCallback(
    (title: string, message: string, opts?: Partial<NotifyOptions>) =>
      notify({ title, message, type: "error", ...opts }),
    [notify]
  );

  const warning = useCallback(
    (title: string, message: string, opts?: Partial<NotifyOptions>) =>
      notify({ title, message, type: "warning", ...opts }),
    [notify]
  );

  const info = useCallback(
    (title: string, message: string, opts?: Partial<NotifyOptions>) =>
      notify({ title, message, type: "info", ...opts }),
    [notify]
  );

  return { notify, success, error, warning, info };
}
