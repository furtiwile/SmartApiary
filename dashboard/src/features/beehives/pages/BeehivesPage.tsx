import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";

import { PageLayout } from "../../../layouts/PageLayout";
import { ApiaryHeader } from "../components/ApiaryHeader";
import { ApiaryEmptyState } from "../components/ApiaryEmptyState";
import { ApiaryTabsList } from "../components/ApiaryTabsList";
import { ApiaryTabContent } from "../components/ApiaryTabContent";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

import { useNotify } from "../../../hooks/useNotify";
import { useApiarySignalR } from "../hooks/useApiarySignalR";
import { useApiaries } from "../hooks/useApiaries";
import { useBeehives } from "../hooks/useBeehives";

export default function BeehivesPage() {
  const { success, error } = useNotify();
  const { joinApiaryGroup, leaveApiaryGroup, connectionState } = useApiarySignalR();
  
  const { apiaries, isLoading: isLoadingApiaries, deleteApiary } = useApiaries();
  
  const [activeApiaryId, setActiveApiaryId] = useState<string | null>(null);
  
  const { beehives: currentHives, isLoading: isLoadingHives, deleteBeehive } = useBeehives(activeApiaryId);
  
  const [deleteHiveTarget, setDeleteHiveTarget] = useState<string | null>(null);
  const [deleteApiaryTarget, setDeleteApiaryTarget] = useState<string | null>(null);

  // Set default active apiary if none selected
  useEffect(() => {
    if (apiaries.length > 0 && !activeApiaryId) {
      queueMicrotask(() => setActiveApiaryId(apiaries[0].id));
    }
  }, [apiaries, activeApiaryId]);

  useEffect(() => {
    if (!activeApiaryId || connectionState !== "Connected") return;
    joinApiaryGroup(activeApiaryId);
    return () => {
      leaveApiaryGroup(activeApiaryId);
    };
  }, [activeApiaryId, joinApiaryGroup, leaveApiaryGroup, connectionState]);

  async function confirmDeleteHive() {
    if (!deleteHiveTarget) return;
    try {
      await deleteBeehive(deleteHiveTarget);
      success("Hive removed", "The hive has been deleted.");
    } catch {
      error("Delete failed", "Could not remove the hive. Please try again.");
    } finally {
      setDeleteHiveTarget(null);
    }
  }

  async function confirmDeleteApiary() {
    if (!deleteApiaryTarget) return;
    try {
      await deleteApiary(deleteApiaryTarget);
      const remaining = apiaries.filter((a) => a.id !== deleteApiaryTarget);
      setActiveApiaryId(remaining.length > 0 ? remaining[0].id : null);
      success("Apiary deleted", "The apiary has been removed.");
    } catch {
      error("Delete failed", "Could not delete the apiary. Please try again.");
    } finally {
      setDeleteApiaryTarget(null);
    }
  }

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
      <ApiaryHeader 
        apiaryCount={apiaries.length} 
        onApiaryCreated={setActiveApiaryId} 
      />

      {apiaries.length === 0 && (
        <ApiaryEmptyState onCreated={(a) => setActiveApiaryId(a.id)} />
      )}

      {apiaries.length > 0 && activeApiaryId && (
        <Tabs.Root value={activeApiaryId} onValueChange={setActiveApiaryId}>
          <ApiaryTabsList apiaries={apiaries} />
          {apiaries.map((apiary) => (
            <Tabs.Content key={apiary.id} value={apiary.id}>
              <ApiaryTabContent 
                apiary={apiary}
                beehives={currentHives}
                isLoadingHives={isLoadingHives}
                onDeleteApiary={setDeleteApiaryTarget}
                onDeleteHive={setDeleteHiveTarget}
              />
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
