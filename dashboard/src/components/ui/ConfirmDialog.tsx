import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

/**
 * A reusable accessible confirmation dialog.
 * Use before any irreversible action (delete, cancel, etc.).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  isDestructive = true,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDestructive ? "bg-rose-500/10" : "bg-amber-500/10"}`}>
              <AlertTriangle className={`h-5 w-5 ${isDestructive ? "text-rose-400" : "text-amber-400"}`} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-slate-100">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="shrink-0 rounded-lg p-1 text-slate-600 hover:text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
