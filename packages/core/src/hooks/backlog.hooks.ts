import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckpointApiClient } from '../services/api-client';
import { queryKeys } from './query-keys';
import { CreateGameDto } from '../types/game';

export function useBacklogList(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.backlog.lists(),
    queryFn: () => client.getBacklog(),
  });
}

export function useCreateBacklog(client: CheckpointApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGameDto) => client.createBacklog(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.lastBacklog });
    },
  });
}

export function useDeleteBacklog(client: CheckpointApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => client.deleteBacklog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.lastBacklog });
    },
  });
}
