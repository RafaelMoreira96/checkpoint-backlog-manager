import { useQuery } from '@tanstack/react-query';
import { CheckpointApiClient } from '../services/api-client';
import { queryKeys } from './query-keys';

export function useConsoles(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.catalog.consoles,
    queryFn: () => client.getConsoles(),
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
}

export function useGenres(client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.catalog.genres,
    queryFn: () => client.getGenres(),
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
}
