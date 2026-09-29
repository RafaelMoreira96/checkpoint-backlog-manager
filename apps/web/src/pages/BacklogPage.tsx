import React, { useState, useMemo } from 'react';
import {
  useBacklogList,
  useDeleteBacklog,
  useConsoles,
  useGenres,
  Game,
} from '@checkpoint/core';
import { api } from '../lib/api';
import { GameGrid } from '../components/games/GameGrid';
import { GameTable } from '../components/games/GameTable';
import {
  Bookmark,
  Search,
  LayoutGrid,
  List,
  Plus,
  X,
} from 'lucide-react';

interface BacklogPageProps {
  onOpenNewBacklog: () => void;
  onEditBacklog: (game: Game) => void;
  onCompleteBacklog: (game: Game) => void;
}

export const BacklogPage: React.FC<BacklogPageProps> = ({
  onOpenNewBacklog,
  onEditBacklog,
  onCompleteBacklog,
}) => {
  const { data: rawBacklog, isLoading } = useBacklogList(api);
  const backlog = useMemo(() => (Array.isArray(rawBacklog) ? rawBacklog : []), [rawBacklog]);
  const deleteMutation = useDeleteBacklog(api);

  const { data: consoles = [] } = useConsoles(api);
  const { data: genres = [] } = useGenres(api);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsole, setSelectedConsole] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered & Sorted Games
  const processedBacklog = useMemo(() => {
    let result = [...backlog];

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
        case 'recent':
          return b.id_game - a.id_game;
        case 'oldest':
          return a.id_game - b.id_game;
        case 'name_asc':
          return a.name_game.localeCompare(b.name_game);
        case 'name_desc':
          return b.name_game.localeCompare(a.name_game);
        case 'year_desc':
          return (Number(b.release_year) || 0) - (Number(a.release_year) || 0);
        case 'year_asc':
          return (Number(a.release_year) || 0) - (Number(b.release_year) || 0);
        default:
          return b.id_game - a.id_game;
      }
    });

    return result;
  }, [backlog, searchTerm, selectedConsole, selectedGenre, sortBy]);

  const hasActiveFilters =
    searchTerm !== '' || selectedConsole !== 'all' || selectedGenre !== 'all' || sortBy !== 'recent';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedConsole('all');
    setSelectedGenre('all');
    setSortBy('recent');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza de que deseja remover este jogo do seu backlog?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232938]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Fila do Backlog
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#fbbf24] font-bold border border-[#f59e0b]/30">
              {backlog.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Títulos na sua fila de espera para jogar, organizar e zerar
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewBacklog}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-lg shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar ao Backlog</span>
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
              placeholder="Buscar título no backlog..."
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
                <option value="recent">Adicionado: Mais Recente</option>
                <option value="oldest">Adicionado: Mais Antigo</option>
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
            Mostrando <span className="font-bold text-white">{processedBacklog.length}</span> de{' '}
            <span className="font-bold text-white">{backlog.length}</span> títulos no backlog
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
          <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Carregando fila do backlog...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <GameGrid
          games={processedBacklog}
          isBacklog={true}
          searchTerm={searchTerm}
          onEdit={onEditBacklog}
          onDelete={handleDelete}
          onComplete={onCompleteBacklog}
          onAddFirst={onOpenNewBacklog}
        />
      ) : (
        <GameTable
          games={processedBacklog}
          isBacklog={true}
          onEdit={onEditBacklog}
          onDelete={handleDelete}
          onComplete={onCompleteBacklog}
        />
      )}
    </div>
  );
};
