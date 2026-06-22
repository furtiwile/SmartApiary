import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Link2, X, ShieldCheck } from "lucide-react";
import { useNotify } from "../../../hooks/useNotify";
import { useApis } from "../../../shared/api/useApis";

const SERIAL_REGEX = /^SA-\d{4}-\d{5}$/;

const schema = z.object({
  serialNumber: z.string().toUpperCase().regex(SERIAL_REGEX, "Format must be SA-YYYY-XXXXX (e.g. SA-2024-00123)"),
});

type SchemaType = z.infer<typeof schema>;

interface DevicePairingModalProps {
  apiaryId: string;
  hiveId: string;
  hiveName: string;
  isPaired: boolean;
  onPaired: () => void;
  onUnpaired: () => void;
}

export function DevicePairingModal({
  apiaryId,
  hiveId,
  hiveName,
  isPaired,
  onPaired,
  onUnpaired,
}: DevicePairingModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmittingUnpair, setIsSubmittingUnpair] = useState(false);
  const { success, error } = useNotify();
  const { devicePairing: devicePairingApi } = useApis();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { serialNumber: "" },
  });

  const watchSerialNumber = useWatch({ control, name: "serialNumber" });
  const isValidSerial = SERIAL_REGEX.test(watchSerialNumber || "");

  async function onSubmit(data: SchemaType) {
    try {
      const ok = await devicePairingApi.pair(apiaryId, hiveId, data.serialNumber);
      if (ok) {
        success(
          "Device paired",
          `SmartScale ${data.serialNumber} is now linked to "${hiveName}". Telemetry will begin shortly.`,
          { duration: 7000 }
        );
        reset();
        setOpen(false);
        onPaired();
      } else {
        error("Pairing failed", "Check the serial number and ensure the device is powered on.");
      }
    } catch {
      error("Pairing failed", "An unexpected error occurred.");
    }
  }

  async function handleUnpair() {
    setIsSubmittingUnpair(true);
    try {
      const ok = await devicePairingApi.unpair(hiveId);
      if (ok) {
        success("Device unpaired", `The SmartScale has been unlinked from "${hiveName}".`);
        setOpen(false);
        onUnpaired();
      } else {
        error("Unpair failed", "Could not remove the device. Please try again.");
      }
    } finally {
      setIsSubmittingUnpair(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${isPaired
            ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
        >
          <Link2 className="h-3 w-3" />
          {isPaired ? "Paired" : "Pair Device"}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                <Link2 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-slate-100">
                  Device Pairing
                </Dialog.Title>
                <p className="text-xs text-slate-500">{hiveName}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {isPaired ? (
            /* Unpair view */
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-300">Device is paired</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This hive is receiving live telemetry from a SmartScale device. To link a different device, unpair first.
                  </p>
                </div>
              </div>
              <button
                onClick={handleUnpair}
                disabled={isSubmittingUnpair}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-700 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-60 transition-all"
              >
                {isSubmittingUnpair ? (
                  <span className="h-4 w-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                {isSubmittingUnpair ? "Unpairing…" : "Unpair Device"}
              </button>
            </div>
          ) : (
            /* Pair view */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  SmartScale Serial Number
                </label>
                <input
                  type="text"
                  placeholder="SA-2024-00123"
                  {...register("serialNumber")}
                  autoFocus
                  maxLength={13}
                  className={`block w-full rounded-lg border bg-slate-800 px-3 py-2 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${watchSerialNumber && !isValidSerial
                    ? "border-rose-500/60 focus:ring-rose-500"
                    : "border-slate-700 focus:ring-indigo-500"
                    }`}
                />
                <p className={`mt-1.5 text-xs ${watchSerialNumber && !isValidSerial ? "text-rose-400" : "text-slate-500"
                  }`}>
                  Format: SA-YYYY-XXXXX (found on the device label)
                </p>
                {errors.serialNumber && <p className="mt-1.5 text-xs text-rose-500">{errors.serialNumber.message}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValidSerial}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Pairing…" : "Pair Device"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
