export const queryKeys = {
  games: {
    all: ['games'] as const,
    lists: () => [...queryKeys.games.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.games.all, 'detail', id] as const,
  },
  backlog: {
    all: ['backlog'] as const,
    lists: () => [...queryKeys.backlog.all, 'list'] as const,
  },
  catalog: {
    consoles: ['catalog', 'consoles'] as const,
    genres: ['catalog', 'genres'] as const,
  },
  stats: {
    all: ['stats'] as const,
    dashboard: ['stats', 'dashboard'] as const,
    lastGames: ['stats', 'last-games'] as const,
    lastBacklog: ['stats', 'last-backlog'] as const,
    landing: ['stats', 'landing'] as const,
    beaten: ['stats', 'beaten'] as const,
    byItem: (type: string, id: number) => ['stats', 'by-item', type, id] as const,
  },
  igdb: {
    search: (query: string) => ['igdb', 'search', query] as const,
  },
};
