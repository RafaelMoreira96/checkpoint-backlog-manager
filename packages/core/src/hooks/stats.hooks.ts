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
