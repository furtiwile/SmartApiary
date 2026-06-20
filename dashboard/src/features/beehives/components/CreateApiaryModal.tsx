import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, Hexagon } from "lucide-react";
import { ApiaryApi } from "../api/apiaryApi";
import { useNotify } from "../../../hooks/useNotify";
import type { ApiaryDto } from "../models/Apiary";

interface CreateApiaryModalProps {
  onCreated: (apiary: ApiaryDto) => void;
}

export function CreateApiaryModal({ onCreated }: CreateApiaryModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "" });
  const { success, error } = useNotify();

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    if (!form.name.trim()) {
      error("Validation", "Apiary name is required.");
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      error("Validation", "Please enter valid coordinates.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      error("Validation", "Coordinates are out of valid geographic range.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ApiaryApi.create({ name: form.name.trim(), latitude: lat, longitude: lng });
      if (result) {
        success("Apiary created", `"${result.name}" has been added to your account.`);
        onCreated(result);
        setOpen(false);
        setForm({ name: "", latitude: "", longitude: "" });
      } else {
        error("Failed to create apiary", "The server returned an error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
          <PlusCircle className="h-4 w-4" />
          New Apiary
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                <Hexagon className="h-5 w-5 text-amber-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-100">New Apiary</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Apiary Name
              </label>
              <input
                type="text"
                placeholder="e.g. Hillside Apiary"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                autoFocus
                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="45.2500"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="19.8420"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              After creating the apiary you can add hives and pair SmartScale devices to them.
            </p>

            <div className="flex gap-3 pt-2">
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
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                {isSubmitting ? "Creating…" : "Create Apiary"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
