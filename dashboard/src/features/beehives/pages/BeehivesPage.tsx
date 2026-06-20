import { useEffect, useState } from "react";
import { PageLayout } from "../../../layouts/PageLayout";
import type { Beehive } from "../models/Beehive";
import { BeehiveApi } from "../api/beehiveApi";
import { BeehiveTable } from "../components/BeehiveTable";
import { CreateBeehiveModal } from "../components/CreateBeehiveModal";
import { useNotify } from "../../../hooks/useNotify";
import { Hexagon } from "lucide-react";

// TODO: Replace with real selected apiary ID once Apiary navigation is implemented (Phase 2).
const PLACEHOLDER_APIARY_ID = "";

function BeehivesPage() {
  const [beehives, setBeehives] = useState<Beehive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useNotify();

  useEffect(() => {
    BeehiveApi.getAll()
      .then(setBeehives)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    const deleted = await BeehiveApi.delete(id);
    if (deleted) {
      setBeehives((prev) => prev.filter((h) => h.id !== id));
      success("Hive removed", "The hive has been deleted from the apiary.");
    } else {
      error("Failed to delete", "Could not remove the hive. Please try again.");
    }
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Hexagon className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight">
              Hive Collection
            </h1>
            <p className="text-slate-400 text-sm">
              Overview and management of all hives in the apiary.
            </p>
          </div>
        </div>
        <CreateBeehiveModal
          apiaryId={PLACEHOLDER_APIARY_ID}
          onCreated={(hive) => setBeehives((prev) => [...prev, hive])}
        />
      </div>

      {/* Table */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-white dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            <span className="text-slate-400 font-medium">Loading hives…</span>
          </div>
        ) : (
          <BeehiveTable beehives={beehives} onDelete={handleDelete} />
        )}
      </div>
    </PageLayout>
  );
}

export default BeehivesPage;
