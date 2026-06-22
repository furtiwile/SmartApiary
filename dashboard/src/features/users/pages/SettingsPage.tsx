import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { Save, Scale } from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState<string>("10");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => usersApi.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setThreshold(settings.weightDropThreshold.toString());
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (val: number) => usersApi.updateSettings({ weightDropThreshold: val }),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSave = () => {
    const val = parseFloat(threshold);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid positive number for the threshold.");
      return;
    }
    updateMutation.mutate(val);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-amber-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage your account preferences and global defaults.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500">
            <Scale className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Smart Scale Alerts</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Global Weight Drop Threshold (kg)
            </label>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              If a hive's weight drops by more than this amount between readings, you will receive a critical alert. This applies to all your paired smart scales unless explicitly overridden on the scale itself.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-32 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-500"
              />
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
