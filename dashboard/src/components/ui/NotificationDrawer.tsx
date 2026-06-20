import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bell, Trash2, CheckCheck, Siren, BatteryLow, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../../hooks/useNotificationStore";
import type { NotificationPayload, NotificationType } from "./Toast";

const typeIcon: Record<NotificationType, React.FC<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeColor: Record<NotificationType, string> = {
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  info: "text-indigo-400",
};

function NotificationItem({ n }: { n: NotificationPayload }) {
  const Icon = typeIcon[n.type];
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${typeColor[n.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 leading-snug">{n.title}</p>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-slate-600 mt-1">
          {n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export function NotificationDrawer() {
  const { notifications, unreadCount, markAllRead, clear } = useNotificationStore();
  const [open, setOpen] = useState(false);

  function handleOpen(state: boolean) {
    setOpen(state);
    if (state) markAllRead();
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-bold text-slate-200">Notifications</span>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                    title="Mark all read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clear}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <BatteryLow className="h-8 w-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-600 mt-1">Real-time alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => <NotificationItem key={n.id} n={n} />)
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
