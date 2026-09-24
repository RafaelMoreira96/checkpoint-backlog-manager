import React, { useState, useMemo } from 'react';
import { useBacklogList, useDeleteBacklog, Game } from '@checkpoint/core';
import { api } from '../lib/api';
import { GameGrid } from '../components/games/GameGrid';
import { GameTable } from '../components/games/GameTable';
import { Bookmark, Search, LayoutGrid, List, Plus } from 'lucide-react';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredGames = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return backlog;
    return backlog.filter((g) => {
      const matchName = g.name_game.toLowerCase().includes(term);
      const matchConsole = g.console?.name_console?.toLowerCase().includes(term) ?? false;
      const matchGenre = g.genre?.name_genre?.toLowerCase().includes(term) ?? false;
      return matchName || matchConsole || matchGenre;
    });
  }, [backlog, searchTerm]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza de que deseja remover este jogo do seu backlog?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-amber-400" />
            Backlog de Jogos
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              {filteredGames.length}
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Títulos na sua fila de espera para jogar e zerar
          </p>
        </div>

        {/* Controls: Search, View Toggle, Add */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no backlog..."
              className="pl-9 pr-4 py-2 w-64 rounded-xl bg-obsidian-800 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-neon"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-obsidian-800 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              title="Visualização em Grade de Capas (3:4)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-violet-neon text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grade</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela Compacta"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-violet-neon text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>

          {/* Add Backlog Button */}
          <button
            onClick={onOpenNewBacklog}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Backlog</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando backlog...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <GameGrid
          games={filteredGames}
          isBacklog={true}
          searchTerm={searchTerm}
          onEdit={onEditBacklog}
          onDelete={handleDelete}
          onComplete={onCompleteBacklog}
          onAddFirst={onOpenNewBacklog}
        />
      ) : (
        <GameTable
          games={filteredGames}
          isBacklog={true}
          onEdit={onEditBacklog}
          onDelete={handleDelete}
          onComplete={onCompleteBacklog}
        />
      )}
    </div>
  );
};
