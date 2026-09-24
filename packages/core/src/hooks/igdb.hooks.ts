import { useQuery } from '@tanstack/react-query';
import { CheckpointApiClient } from '../services/api-client';
import { queryKeys } from './query-keys';

export function useIGDBSearch(query: string, client: CheckpointApiClient) {
  return useQuery({
    queryKey: queryKeys.igdb.search(query),
    queryFn: () => client.searchIGDB(query),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
