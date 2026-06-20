import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Hexagon, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import type { Beehive } from "../models/Beehive";
import type { ApiaryDto } from "../models/Apiary";
import { BeehiveApi } from "../api/beehiveApi";
import { ApiaryApi } from "../api/apiaryApi";
import { BeehiveTable } from "../components/BeehiveTable";
import { CreateBeehiveModal } from "../components/CreateBeehiveModal";
import { CreateApiaryModal } from "../components/CreateApiaryModal";
import { HiveTelemetryPanel } from "../components/HiveTelemetryPanel";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useNotify } from "../../../hooks/useNotify";
import { useAuth } from "../../users/hooks/AuthHook";
import { useApiarySignalR } from "../contexts/ApiarySignalRContext";

function BeehivesPage() {
  const { user } = useAuth();
  const { success, error } = useNotify();
  const { joinApiaryGroup, leaveApiaryGroup } = useApiarySignalR();

  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [hivesByApiary, setHivesByApiary] = useState<Record<string, Beehive[]>>({});
  const [isLoadingApiaries, setIsLoadingApiaries] = useState(true);

  const [activeApiaryId, setActiveApiaryId] = useState<string | null>(null);
  const [expandedHiveId, setExpandedHiveId] = useState<string | null>(null);
  const fetchedApiaries = useRef<Set<string>>(new Set());

  const [deleteHiveTarget, setDeleteHiveTarget] = useState<string | null>(null);
  const [deleteApiaryTarget, setDeleteApiaryTarget] = useState<string | null>(null);

  // Load apiaries on mount
  useEffect(() => {
    if (!user?.id) return;
    ApiaryApi.getByBeekeeper(user.id)
      .then((data) => {
        setApiaries(data);
        if (data.length > 0) setActiveApiaryId(data[0].id);
      })
      .finally(() => setIsLoadingApiaries(false));
  }, [user?.id]);

  // Lazy-load hives + switch SignalR group when tab changes
  useEffect(() => {
    if (!activeApiaryId) return;

    // Join the new group
    joinApiaryGroup(activeApiaryId);

    if (!fetchedApiaries.current.has(activeApiaryId)) {
      fetchedApiaries.current.add(activeApiaryId);
      BeehiveApi.getByApiaryId(activeApiaryId)
        .then((hives) => setHivesByApiary((prev) => ({ ...prev, [activeApiaryId]: hives })));
    }

    return () => {
      leaveApiaryGroup(activeApiaryId);
    };
  }, [activeApiaryId, joinApiaryGroup, leaveApiaryGroup]);

  async function confirmDeleteHive() {
    if (!deleteHiveTarget || !activeApiaryId) return;
    const deleted = await BeehiveApi.delete(deleteHiveTarget);
    if (deleted) {
      setHivesByApiary((prev) => ({
        ...prev,
        [activeApiaryId]: (prev[activeApiaryId] ?? []).filter((h) => h.id !== deleteHiveTarget),
      }));
      if (expandedHiveId === deleteHiveTarget) setExpandedHiveId(null);
      success("Hive removed", "The hive has been deleted.");
    } else {
      error("Delete failed", "Could not remove the hive. Please try again.");
    }
    setDeleteHiveTarget(null);
  }

  async function confirmDeleteApiary() {
    if (!deleteApiaryTarget) return;
    const deleted = await ApiaryApi.delete(deleteApiaryTarget);
    if (deleted) {
      const remaining = apiaries.filter((a) => a.id !== deleteApiaryTarget);
      setApiaries(remaining);
      setHivesByApiary((prev) => { const n = { ...prev }; delete n[deleteApiaryTarget]; return n; });
      setActiveApiaryId(remaining.length > 0 ? remaining[0].id : null);
      success("Apiary deleted", "The apiary has been removed.");
    } else {
      error("Delete failed", "Could not delete the apiary. Please try again.");
    }
    setDeleteApiaryTarget(null);
  }

  const currentHives = activeApiaryId ? (hivesByApiary[activeApiaryId] ?? []) : [];
  const isLoadingHives = activeApiaryId ? hivesByApiary[activeApiaryId] === undefined : false;

  if (isLoadingApiaries) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center p-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          <span className="text-slate-400 font-medium">Loading apiaries…</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Hexagon className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight">My Apiaries</h1>
            <p className="text-slate-400 text-sm">
              {apiaries.length === 0
                ? "No apiaries yet — create your first one below."
                : `${apiaries.length} apiar${apiaries.length === 1 ? "y" : "ies"} registered`}
            </p>
          </div>
        </div>
        <CreateApiaryModal
          onCreated={(a) => {
            setApiaries((prev) => [...prev, a]);
            setActiveApiaryId(a.id);
          }}
        />
      </div>

      {/* Empty state */}
      {apiaries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30">
          <Hexagon className="h-16 w-16 text-slate-700 mb-4" />
          <p className="text-slate-300 font-semibold text-lg">No apiaries yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">Create your first apiary to start tracking hives and telemetry.</p>
          <CreateApiaryModal onCreated={(a) => { setApiaries([a]); setActiveApiaryId(a.id); }} />
        </div>
      )}

      {/* Apiary tabs */}
      {apiaries.length > 0 && activeApiaryId && (
        <Tabs.Root value={activeApiaryId} onValueChange={setActiveApiaryId}>
          <Tabs.List className="flex gap-1 overflow-x-auto mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
            {apiaries.map((apiary) => (
              <Tabs.Trigger
                key={apiary.id}
                value={apiary.id}
                className="group flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:text-slate-200 data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 data-[state=active]:shadow-sm"
              >
                <Hexagon className="h-3.5 w-3.5" />
                {apiary.name}
                <ChevronRight className="h-3 w-3 opacity-0 group-data-[state=active]:opacity-100 text-amber-400 transition-opacity" />
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {apiaries.map((apiary) => (
            <Tabs.Content key={apiary.id} value={apiary.id}>
              {/* Apiary sub-header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">{apiary.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {apiary.latitude.toFixed(5)}, {apiary.longitude.toFixed(5)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CreateBeehiveModal
                    apiaryId={apiary.id}
                    onCreated={(hive) => setHivesByApiary((prev) => ({
                      ...prev,
                      [apiary.id]: [...(prev[apiary.id] ?? []), hive],
                    }))}
                  />
                  <button
                    onClick={() => setDeleteApiaryTarget(apiary.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Apiary
                  </button>
                </div>
              </div>

              {/* Hive table */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden mb-6">
                {isLoadingHives ? (
                  <div className="flex justify-center items-center p-16 gap-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-amber-500" />
                    <span className="text-slate-400 text-sm">Loading hives…</span>
                  </div>
                ) : (
                  <BeehiveTable
                    beehives={currentHives}
                    onDelete={(id) => setDeleteHiveTarget(id)}
                  />
                )}
              </div>

              {/* Per-hive telemetry + diary panels */}
              {!isLoadingHives && currentHives.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                    Hive Telemetry & Diaries
                  </p>
                  {currentHives.map((hive) => {
                    const isExpanded = expandedHiveId === hive.id;
                    return (
                      <div key={hive.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
                          onClick={() => setExpandedHiveId(isExpanded ? null : hive.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Hexagon className="h-4 w-4 text-amber-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-200">{hive.name}</span>
                            {hive.smartScaleId && (
                              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                                Paired
                              </span>
                            )}
                          </div>
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4 text-slate-600" />
                            : <ChevronRight className="h-4 w-4 text-slate-600" />}
                        </button>
                        {isExpanded && (
                          <div className="border-t border-slate-800 px-5 py-5">
                            <HiveTelemetryPanel hive={hive} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}

      <ConfirmDialog
        open={deleteHiveTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteHiveTarget(null); }}
        title="Delete hive?"
        description="This action is permanent. The hive, its inspection diary, and all associated telemetry will be removed."
        confirmLabel="Delete Hive"
        onConfirm={confirmDeleteHive}
      />
      <ConfirmDialog
        open={deleteApiaryTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteApiaryTarget(null); }}
        title="Delete entire apiary?"
        description="This will permanently delete the apiary and ALL of its hives, inspections, and device pairings. This cannot be undone."
        confirmLabel="Delete Apiary"
        onConfirm={confirmDeleteApiary}
      />
    </PageLayout>
  );
}

export default BeehivesPage;
