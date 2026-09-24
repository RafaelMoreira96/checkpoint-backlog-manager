import { useQuery } from '@tanstack/react-query';
import { CheckpointApiClient } from '../services/api-client';
import { queryKeys } from './query-keys';

export function useDashboardStats(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: () => client.getDashboardStats(),
  });
}

export function useLastGamesBeaten(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.stats.lastGames,
    queryFn: () => client.getLastGamesBeaten(),
  });
}

export function useLastBacklog(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.stats.lastBacklog,
    queryFn: () => client.getLastBacklog(),
  });
}

export function useLandingPageStats(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.stats.landing,
    queryFn: () => client.getLandingPageStats(),
  });
}

export function useBeatenStats(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.stats.beaten,
    queryFn: () => client.getBeatenStats(),
  });
}

export function useStatsByItem(
  type: 'genre' | 'console' | 'year' | null,
  id: number | null,
  client: CheckpointApiClient
) {
  return useQuery({
    queryKey: queryKeys.stats.byItem(type || '', id || 0),
    queryFn: () => {
      if (!type || !id) throw new Error('Missing type or id');
      if (type === 'genre') return client.getStatsByGenre(id);
      if (type === 'console') return client.getStatsByConsole(id);
      return client.getStatsByReleaseYear(id);
    },
    enabled: !!type && !!id,
  });
}

