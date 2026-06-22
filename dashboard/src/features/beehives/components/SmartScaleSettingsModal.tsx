import { useState, useEffect } from "react";
import { X, Save, Scale } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { smartScalesApi } from "../../smart-scales/api/smartScalesApi";
import toast from "react-hot-toast";

interface SmartScaleSettingsModalProps {
  smartScaleId: string;
  serialNumber: string;
  isOpen: boolean;
  onClose: () => void;
  initialThreshold?: number | null;
}

export function SmartScaleSettingsModal({
  smartScaleId,
  serialNumber,
  isOpen,
  onClose,
  initialThreshold,
}: SmartScaleSettingsModalProps) {
  const queryClient = useQueryClient();
  const [useDefault, setUseDefault] = useState(initialThreshold === undefined || initialThreshold === null);
  const [customThreshold, setCustomThreshold] = useState<string>(
    initialThreshold !== undefined && initialThreshold !== null ? initialThreshold.toString() : "10.0"
  );

  const mutation = useMutation({
    mutationFn: (threshold: number | null) => smartScalesApi.updateThreshold(smartScaleId, threshold),
    onSuccess: () => {
      toast.success("Scale threshold updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hives"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to update scale threshold");
    },
  });

  useEffect(() => {
    if (isOpen) {
      setUseDefault(initialThreshold === undefined || initialThreshold === null);
      setCustomThreshold(initialThreshold !== undefined && initialThreshold !== null ? initialThreshold.toString() : "10.0");
    }
  }, [isOpen, initialThreshold]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (useDefault) {
      mutation.mutate(null);
    } else {
      const val = parseFloat(customThreshold);
      if (isNaN(val) || val <= 0) {
        toast.error("Please enter a valid positive number.");
        return;
      }
      mutation.mutate(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-500">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Scale Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-800/50 p-4">
            <p className="text-sm font-medium text-slate-300">
              SmartScale SN: <span className="text-amber-400 font-mono">{serialNumber}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="useDefault"
                checked={useDefault}
                onChange={() => setUseDefault(true)}
                className="h-4 w-4 text-amber-500 accent-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="useDefault" className="text-sm font-medium text-slate-200">
                Use Beekeeper Global Default
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="useCustom"
                checked={!useDefault}
                onChange={() => setUseDefault(false)}
                className="mt-1 h-4 w-4 text-amber-500 accent-amber-500 focus:ring-amber-500"
              />
              <div className="flex-1">
                <label htmlFor="useCustom" className="text-sm font-medium text-slate-200">
                  Custom Weight Drop Threshold (kg)
                </label>
                {!useDefault && (
                  <div className="mt-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={customThreshold}
                      onChange={(e) => setCustomThreshold(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="e.g. 10.0"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
