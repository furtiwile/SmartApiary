import { useState } from "react";
import { ClipboardList, PlusCircle } from "lucide-react";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useHiveDiary } from "../hooks/useHiveDiary";
import type { InspectionEntry } from "../models/Inspection";
import { HiveDiaryForm } from "./HiveDiaryForm";
import { HiveDiaryList } from "./HiveDiaryList";

interface HiveDiaryProps {
  hiveId: string;
}

export function HiveDiary({ hiveId }: HiveDiaryProps) {
  const { entries, isLoading, createEntry, isCreating, deleteEntry } = useHiveDiary(hiveId);

  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = async (data: Omit<InspectionEntry, "id" | "hiveId">) => {
    await createEntry(data);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteEntry(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">Hive Diary</h3>
          {!isLoading && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
              {entries.length} entries
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Log Inspection
        </button>
      </div>

      {showForm && (
        <HiveDiaryForm 
          onSubmit={handleSubmit} 
          onCancel={() => setShowForm(false)} 
          isSubmitting={isCreating} 
        />
      )}

      <HiveDiaryList 
        entries={entries} 
        isLoading={isLoading} 
        onDelete={setConfirmDeleteId} 
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Delete inspection entry?"
        description="This entry will be permanently removed from the hive diary."
        confirmLabel="Delete Entry"
        onConfirm={handleDelete}
      />
    </div>
  );
}
