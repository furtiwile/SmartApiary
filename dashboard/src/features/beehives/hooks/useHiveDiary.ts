import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApis } from "../../../shared/api/useApis";
import type { InspectionEntry } from "../models/Inspection";
import { useNotify } from "../../../hooks/useNotify";

export function useHiveDiary(hiveId: string) {
  const { inspections: inspectionApi } = useApis();
  const queryClient = useQueryClient();
  const { success, error } = useNotify();

  const queryKey = ["inspections", hiveId];

  const { data: entries = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      inspectionApi.getByHive(hiveId).then((data) =>
        data.sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))
      ),
    enabled: !!hiveId,
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: Omit<InspectionEntry, "id" | "hiveId">) => inspectionApi.create({ ...data, hiveId }),
    onSuccess: (result) => {
      if (result) {
        queryClient.setQueryData<InspectionEntry[]>(queryKey, (old) => [
          result,
          ...(old || []),
        ]);
        success("Inspection logged", `Entry added to the diary.`);
      } else {
        error("Save failed", "Could not save the inspection. Please try again.");
      }
    },
    onError: () => {
      error("Save failed", "An unexpected error occurred.");
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => inspectionApi.delete(entryId, hiveId),
    onSuccess: (ok, entryId) => {
      if (ok) {
        queryClient.setQueryData<InspectionEntry[]>(queryKey, (old) =>
          old?.filter((e) => e.id !== entryId)
        );
        success("Entry removed", "The inspection entry has been deleted.");
      } else {
        error("Delete failed", "Could not remove the entry. Please try again.");
      }
    },
  });

  return {
    entries,
    isLoading,
    createEntry: createEntryMutation.mutateAsync,
    isCreating: createEntryMutation.isPending,
    deleteEntry: deleteEntryMutation.mutateAsync,
    isDeleting: deleteEntryMutation.isPending,
  };
}
