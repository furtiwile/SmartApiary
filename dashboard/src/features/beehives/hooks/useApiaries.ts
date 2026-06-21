import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApis } from "../../../shared/api/useApis";
import { useAuth } from "../../users/hooks/AuthHook";
import type { ApiaryDto } from "../models/Apiary";

export function useApiaries() {
  const { user } = useAuth();
  const { apiaries: apiaryApi } = useApis();
  const queryClient = useQueryClient();
  const queryKey = ["apiaries", user?.id];

  const { data: apiaries = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => (user?.id ? apiaryApi.getByBeekeeper(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const deleteApiaryMutation = useMutation({
    mutationFn: (apiaryId: string) => apiaryApi.delete(apiaryId),
    onSuccess: (deleted, apiaryId) => {
      if (deleted) {
        queryClient.setQueryData<ApiaryDto[]>(queryKey, (old) =>
          old?.filter((a) => a.id !== apiaryId) || []
        );
      }
    },
  });

  const createApiaryMutation = useMutation({
    // We expect the creation component to still use the modal, but it can use this if we refactor it.
    // For now, returning standard mutation structure.
    mutationFn: (data: FormData) => apiaryApi.create(data), // assuming create takes FormData
    onSuccess: (newApiary) => {
      queryClient.setQueryData<ApiaryDto[]>(queryKey, (old) => [...(old || []), newApiary]);
    },
  });

  return {
    apiaries,
    isLoading,
    error,
    deleteApiary: deleteApiaryMutation.mutateAsync,
    isDeleting: deleteApiaryMutation.isPending,
    createApiary: createApiaryMutation.mutateAsync,
  };
}
