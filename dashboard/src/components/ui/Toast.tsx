import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const CONFIG: Record<
  NotificationType,
  { icon: React.FC<{ className?: string }>; colors: string; bar: string }
> = {
  success: {
    icon: CheckCircle,
    colors:
      "bg-emerald-950/80 border-emerald-700/60 text-emerald-100",
    bar: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    colors: "bg-rose-950/80 border-rose-700/60 text-rose-100",
    bar: "bg-rose-500",
  },
  warning: {
    icon: AlertTriangle,
    colors:
      "bg-amber-950/80 border-amber-700/60 text-amber-100",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    colors: "bg-slate-900/80 border-slate-700/60 text-slate-100",
    bar: "bg-indigo-500",
  },
};

interface RichToastProps {
  notification: NotificationPayload;
  onDismiss: () => void;
  visible: boolean;
}

export function RichToast({ notification, onDismiss, visible }: RichToastProps) {
  const { type, title, message, action } = notification;
  const { icon: Icon, colors, bar } = CONFIG[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className={`relative flex items-start gap-3 w-80 rounded-xl border backdrop-blur-md shadow-2xl px-4 py-3 overflow-hidden ${colors}`}
        >
          {/* Left accent bar */}
          <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${bar}`} />

          <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">{title}</p>
            <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{message}</p>
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-xs font-bold underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
              >
                {action.label}
              </button>
            )}
          </div>

          <button
            onClick={onDismiss}
            className="shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
