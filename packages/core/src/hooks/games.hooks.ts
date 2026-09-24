import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckpointApiClient } from '../services/api-client';
import { queryKeys } from './query-keys';
import { CreateGameDto, UpdateGameDto } from '../types/game';

export function useGamesList(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.games.lists(),
    queryFn: () => client.getGames(),
  });
}

export function useGameDetail(id: number, client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.games.detail(id),
    queryFn: () => client.getGame(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateGame(client: CheckpointApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGameDto) => client.createGame(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.lastGames });
    },
  });
}

export function useUpdateGame(client: CheckpointApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGameDto }) =>
      client.updateGame(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useDeleteGame(client: CheckpointApiClient) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => client.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.lastGames });
    },
  });
}
