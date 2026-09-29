import React, { useState, useMemo } from 'react';
import {
  useGamesList,
  useDeleteGame,
  useClearAllBeatenGames,
  useConsoles,
  useGenres,
  Game,
} from '@checkpoint/core';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GameGrid } from '../components/games/GameGrid';
import { GameTable } from '../components/games/GameTable';
import { ClearAllGamesModal } from '../components/games/ClearAllGamesModal';
import { parseDateToBeatingTimestamp } from '../lib/dateUtils';
import {
  Trophy,
  Search,
  LayoutGrid,
  List,
  Plus,
  X,
  UploadCloud,
  Trash2,
} from 'lucide-react';

interface BeatenGamesPageProps {
  onOpenNewGame: () => void;
  onEditGame: (game: Game) => void;
  onOpenImportCSV?: () => void;
}

export const BeatenGamesPage: React.FC<BeatenGamesPageProps> = ({
  onOpenNewGame,
  onEditGame,
  onOpenImportCSV,
}) => {
  const { user } = useAuth();
  const { data: rawGames, isLoading } = useGamesList(api);
  const games = useMemo(() => (Array.isArray(rawGames) ? rawGames : []), [rawGames]);
  const deleteMutation = useDeleteGame(api);
  const clearAllMutation = useClearAllBeatenGames(api);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const { data: consoles = [] } = useConsoles(api);
  const { data: genres = [] } = useGenres(api);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsole, setSelectedConsole] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered & Sorted Games
  const processedGames = useMemo(() => {
    let result = [...games];

    // Search filter
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter((g) => {
        const matchName = g.name_game.toLowerCase().includes(term);
        const matchConsole = g.console?.name_console?.toLowerCase().includes(term) ?? false;
        const matchGenre = g.genre?.name_genre?.toLowerCase().includes(term) ?? false;
        const matchDev = g.developer?.toLowerCase().includes(term) ?? false;
        return matchName || matchConsole || matchGenre || matchDev;
      });
    }

    // Console filter
    if (selectedConsole !== 'all') {
      const consoleId = Number(selectedConsole);
      result = result.filter((g) => g.console_id === consoleId);
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      const genreId = Number(selectedGenre);
      result = result.filter((g) => g.genre_id === genreId);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': {
          const timeA = parseDateToBeatingTimestamp(a.date_beating);
          const timeB = parseDateToBeatingTimestamp(b.date_beating);

          // If neither has a valid completion date, tiebreak by id_game descending
          if (timeA === 0 && timeB === 0) return b.id_game - a.id_game;
          // Items without date go to the end
          if (timeA === 0) return 1;
          if (timeB === 0) return -1;

          if (timeB !== timeA) return timeB - timeA;
          return b.id_game - a.id_game;
        }
        case 'date_asc': {
          const timeA = parseDateToBeatingTimestamp(a.date_beating);
          const timeB = parseDateToBeatingTimestamp(b.date_beating);

          // If neither has a valid completion date, tiebreak by id_game ascending
          if (timeA === 0 && timeB === 0) return a.id_game - b.id_game;
          // Items without date go to the end
          if (timeA === 0) return 1;
          if (timeB === 0) return -1;

          if (timeA !== timeB) return timeA - timeB;
          return a.id_game - b.id_game;
        }
        case 'time_desc': {
          const diff = (Number(b.time_beating) || 0) - (Number(a.time_beating) || 0);
          return diff !== 0 ? diff : b.id_game - a.id_game;
        }
        case 'time_asc': {
          const diff = (Number(a.time_beating) || 0) - (Number(b.time_beating) || 0);
          return diff !== 0 ? diff : a.id_game - b.id_game;
        }
        case 'name_asc': {
          const diff = a.name_game.localeCompare(b.name_game);
          return diff !== 0 ? diff : b.id_game - a.id_game;
        }
        case 'name_desc': {
          const diff = b.name_game.localeCompare(a.name_game);
          return diff !== 0 ? diff : b.id_game - a.id_game;
        }
        case 'year_desc': {
          const diff = (Number(b.release_year) || 0) - (Number(a.release_year) || 0);
          return diff !== 0 ? diff : b.id_game - a.id_game;
        }
        case 'year_asc': {
          const diff = (Number(a.release_year) || 0) - (Number(b.release_year) || 0);
          return diff !== 0 ? diff : a.id_game - b.id_game;
        }
        default:
          return b.id_game - a.id_game;
      }
    });

    return result;
  }, [games, searchTerm, selectedConsole, selectedGenre, sortBy]);

  const hasActiveFilters =
    searchTerm !== '' || selectedConsole !== 'all' || selectedGenre !== 'all' || sortBy !== 'date_desc';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedConsole('all');
    setSelectedGenre('all');
    setSortBy('date_desc');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza de que deseja remover este jogo da sua lista de zerados?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleConfirmClearAll = async () => {
    await clearAllMutation.mutateAsync();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232938]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Jogos Zerados
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] font-bold border border-[#10b981]/30">
              {games.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Biblioteca completa de títulos zerados, horas dedicadas e datas de conclusão
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {games.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/25 hover:border-rose-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Excluir todos os registros de jogos zerados com dupla confirmação"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline">Limpar Tudo</span>
            </button>
          )}

          {onOpenImportCSV && (
            <button
              onClick={onOpenImportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#232938] hover:bg-[#2d3446] text-slate-200 hover:text-white border border-[#2d3446] transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Importar catálogo em lotes via arquivo CSV"
            >
              <UploadCloud className="w-4 h-4 text-[#8b77f7]" />
              <span>Importar CSV</span>
            </button>
          )}
          <button
            onClick={onOpenNewGame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-lg shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Conquista</span>
          </button>
        </div>
      </div>

      {/* Backloggd Filter & Sort Toolbar */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#161922] border border-[#232938] space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por jogo, plataforma, desenvolvedor..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6c52ee] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Platform, Genre, Sort, View */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Platform Select */}
            <div className="relative">
              <select
                value={selectedConsole}
                onChange={(e) => setSelectedConsole(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#6c52ee] cursor-pointer"
              >
                <option value="all">Todas Plataformas</option>
                {consoles.map((c) => (
                  <option key={c.id_console} value={c.id_console}>
                    {c.name_console}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre Select */}
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#6c52ee] cursor-pointer"
              >
                <option value="all">Todos Gêneros</option>
                {genres.map((g) => (
                  <option key={g.id_genre} value={g.id_genre}>
                    {g.name_genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-xs font-semibold text-[#8670ff] focus:outline-none focus:border-[#6c52ee] cursor-pointer"
              >
                <option value="date_desc">Conclusão: Mais Recente</option>
                <option value="date_asc">Conclusão: Mais Antigo</option>
                <option value="time_desc">Tempo: Maior Duração</option>
                <option value="time_asc">Tempo: Menor Duração</option>
                <option value="name_asc">Título: A - Z</option>
                <option value="name_desc">Título: Z - A</option>
                <option value="year_desc">Lançamento: Mais Novo</option>
                <option value="year_asc">Lançamento: Mais Antigo</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#12151b] border border-[#262d3d]">
              <button
                onClick={() => setViewMode('grid')}
                title="Grade de Capas (Estilo Backloggd)"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#6c52ee] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Tabela Detalhada"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#6c52ee] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status line & Filter reset */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <div>
            Mostrando <span className="font-bold text-white">{processedGames.length}</span> de{' '}
            <span className="font-bold text-white">{games.length}</span> jogos zerados
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#8670ff] hover:text-[#a594fd] flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Carregando catálogo de conquistas...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <GameGrid
          games={processedGames}
          searchTerm={searchTerm}
          onEdit={onEditGame}
          onDelete={handleDelete}
          onAddFirst={onOpenNewGame}
        />
      ) : (
        <GameTable
          games={processedGames}
          onEdit={onEditGame}
          onDelete={handleDelete}
        />
      )}

      {/* Double Confirmation Modal to Clear All Games */}
      <ClearAllGamesModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        gamesCount={games.length}
        nickname={user?.nickname || ''}
      />
    </div>
  );
};
