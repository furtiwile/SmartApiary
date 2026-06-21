import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApis } from "../../../shared/api/useApis";
import type { Beehive } from "../models/Beehive";

export function useBeehives(apiaryId: string | null) {
  const { beehives: beehiveApi } = useApis();
  const queryClient = useQueryClient();
  const queryKey = ["hives", apiaryId];

  const { data: beehives = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => (apiaryId ? beehiveApi.getByApiaryId(apiaryId) : Promise.resolve([])),
    enabled: !!apiaryId,
  });

  const deleteBeehiveMutation = useMutation({
    mutationFn: (hiveId: string) => beehiveApi.delete(hiveId),
    onSuccess: (deleted, hiveId) => {
      if (deleted) {
        queryClient.setQueryData<Beehive[]>(queryKey, (old) =>
          old?.filter((h) => h.id !== hiveId) || []
        );
      }
    },
  });

  const createBeehiveMutation = useMutation({
    mutationFn: (data: Parameters<typeof beehiveApi.create>[0]) => beehiveApi.create(data),
    onSuccess: (newHive) => {
      if (newHive) {
        queryClient.setQueryData<Beehive[]>(queryKey, (old) => [...(old || []), newHive]);
      }
    },
  });

  return {
    beehives,
    isLoading,
    error,
    deleteBeehive: deleteBeehiveMutation.mutateAsync,
    isDeleting: deleteBeehiveMutation.isPending,
    createBeehive: createBeehiveMutation.mutateAsync,
    isCreating: createBeehiveMutation.isPending,
  };
}
