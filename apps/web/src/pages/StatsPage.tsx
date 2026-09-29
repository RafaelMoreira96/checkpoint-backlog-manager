import React, { useState, useMemo } from 'react';
import { useBeatenStats } from '@checkpoint/core';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StatsDetailModal } from '../components/stats/StatsDetailModal';
import {
  BarChart3,
  Tag,
  Tv,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { isAuthenticated, openLogin } = useAuth();
  const { data: rawStats, isLoading } = useBeatenStats(api);

  const [activeCategory, setActiveCategory] = useState<'all' | 'genre' | 'console' | 'year'>('all');

  // Pagination states (8 items per page)
  const itemsPerPage = 8;
  const [genrePage, setGenrePage] = useState(1);
  const [consolePage, setConsolePage] = useState(1);
  const [yearPage, setYearPage] = useState(1);

  // Selected item for detail modal
  const [selectedItem, setSelectedItem] = useState<{
    type: 'genre' | 'console' | 'year';
    id: number;
    title: string;
  } | null>(null);

  // Filter out items with 0 count
  const genreStats = useMemo(
    () => (Array.isArray(rawStats?.genreStats) ? rawStats!.genreStats.filter((g) => g.genre_count > 0) : []),
    [rawStats]
  );
  const consoleStats = useMemo(
    () => (Array.isArray(rawStats?.consoleStats) ? rawStats!.consoleStats.filter((c) => c.game_count > 0) : []),
    [rawStats]
  );
  const yearStats = useMemo(
    () => (Array.isArray(rawStats?.yearStats) ? rawStats!.yearStats.filter((y) => y.year_count > 0) : []),
    [rawStats]
  );

  // Paginated slices
  const paginatedGenres = useMemo(() => {
    const start = (genrePage - 1) * itemsPerPage;
    return genreStats.slice(start, start + itemsPerPage);
  }, [genreStats, genrePage]);

  const paginatedConsoles = useMemo(() => {
    const start = (consolePage - 1) * itemsPerPage;
    return consoleStats.slice(start, start + itemsPerPage);
  }, [consoleStats, consolePage]);

  const paginatedYears = useMemo(() => {
    const start = (yearPage - 1) * itemsPerPage;
    return yearStats.slice(start, start + itemsPerPage);
  }, [yearStats, yearPage]);

  const totalGenrePages = Math.ceil(genreStats.length / itemsPerPage) || 1;
  const totalConsolePages = Math.ceil(consoleStats.length / itemsPerPage) || 1;
  const totalYearPages = Math.ceil(yearStats.length / itemsPerPage) || 1;

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#6c52ee]/15 border border-[#6c52ee]/30 text-[#8670ff] flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Estatísticas Gamísticas</h2>
        <p className="text-sm text-slate-400">
          Faça login para desbloquear suas estatísticas avançadas por gênero, plataforma e ano de lançamento, no estilo Backloggd.
        </p>
        <button
          onClick={openLogin}
          className="px-6 py-3 rounded-lg bg-[#6c52ee] hover:bg-[#5b40e2] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#6c52ee]/30 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Entrar na Conta</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#232938]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#6c52ee]/15 border border-[#6c52ee]/30 flex items-center justify-center text-[#8670ff]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Estatísticas Gamísticas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Métricas aprofundadas da sua biblioteca de conquistas por gênero, plataforma e lançamento
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[#161922] border border-[#232938] text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-[#6c52ee] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos
          </button>
          <button
            onClick={() => setActiveCategory('genre')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'genre'
                ? 'bg-[#f59e0b] text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Gêneros
          </button>
          <button
            onClick={() => setActiveCategory('console')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'console'
                ? 'bg-[#0ea5e9] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Plataformas
          </button>
          <button
            onClick={() => setActiveCategory('year')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'year'
                ? 'bg-[#10b981] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Anos
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#6c52ee] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Calculando dados gamísticos...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Seção 1: Por Gênero */}
          {(activeCategory === 'all' || activeCategory === 'genre') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#f59e0b]" />
                  Por Gênero
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30">
                    {genreStats.length} gêneros
                  </span>
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">Clique no card para ver detalhes</span>
              </div>

              {genreStats.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161922] border border-[#232938] text-slate-500 text-sm">
                  Nenhum jogo zerado registrado para exibir gêneros.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedGenres.map((genre) => (
                      <div
                        key={genre.genre_id}
                        onClick={() =>
                          setSelectedItem({
                            type: 'genre',
                            id: genre.genre_id,
                            title: genre.name_genre,
                          })
                        }
                        className="p-5 rounded-xl bg-[#161922] border border-[#232938] hover:border-[#f59e0b]/50 hover:-translate-y-1 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-display font-extrabold text-white">
                            {genre.genre_count}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30">
                            {Number(genre.percentage_genre || 0).toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-[#fbbf24] transition-colors truncate">
                          {genre.name_genre}
                        </h4>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#12151b] rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#f59e0b] to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(genre.percentage_genre || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalGenrePages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        disabled={genrePage === 1}
                        onClick={() => setGenrePage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                      </button>
                      <span className="text-xs text-slate-500 px-2">
                        Página {genrePage} de {totalGenrePages}
                      </span>
                      <button
                        disabled={genrePage === totalGenrePages}
                        onClick={() => setGenrePage((p) => Math.min(p + 1, totalGenrePages))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Próximo <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Seção 2: Por Plataforma / Console */}
          {(activeCategory === 'all' || activeCategory === 'console') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#38bdf8]" />
                  Por Plataforma / Console
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                    {consoleStats.length} plataformas
                  </span>
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">Clique no card para ver detalhes</span>
              </div>

              {consoleStats.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161922] border border-[#232938] text-slate-500 text-sm">
                  Nenhuma plataforma com jogos concluídos.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedConsoles.map((console) => (
                      <div
                        key={console.console_id}
                        onClick={() =>
                          setSelectedItem({
                            type: 'console',
                            id: console.console_id,
                            title: console.name_console,
                          })
                        }
                        className="p-5 rounded-xl bg-[#161922] border border-[#232938] hover:border-[#38bdf8]/50 hover:-translate-y-1 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-display font-extrabold text-white">
                            {console.game_count}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                            {Number(console.percentage_console || 0).toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-[#38bdf8] transition-colors truncate">
                          {console.name_console}
                        </h4>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#12151b] rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0ea5e9] to-cyan-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(console.percentage_console || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalConsolePages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        disabled={consolePage === 1}
                        onClick={() => setConsolePage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                      </button>
                      <span className="text-xs text-slate-500 px-2">
                        Página {consolePage} de {totalConsolePages}
                      </span>
                      <button
                        disabled={consolePage === totalConsolePages}
                        onClick={() => setConsolePage((p) => Math.min(p + 1, totalConsolePages))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Próximo <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Seção 3: Por Ano de Lançamento */}
          {(activeCategory === 'all' || activeCategory === 'year') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#10b981]" />
                  Por Ano de Lançamento
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                    {yearStats.length} safras
                  </span>
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">Clique no card para ver detalhes</span>
              </div>

              {yearStats.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161922] border border-[#232938] text-slate-500 text-sm">
                  Nenhum ano de lançamento registrado.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedYears.map((year) => (
                      <div
                        key={year.year}
                        onClick={() =>
                          setSelectedItem({
                            type: 'year',
                            id: year.year,
                            title: `Ano ${year.year}`,
                          })
                        }
                        className="p-5 rounded-xl bg-[#161922] border border-[#232938] hover:border-[#10b981]/50 hover:-translate-y-1 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-display font-extrabold text-white">
                            {year.year_count}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                            {Number(year.percentage_year || 0).toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-[#10b981] transition-colors">
                          Lançamento {year.year}
                        </h4>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#12151b] rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#10b981] to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(year.percentage_year || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalYearPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        disabled={yearPage === 1}
                        onClick={() => setYearPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                      </button>
                      <span className="text-xs text-slate-500 px-2">
                        Página {yearPage} de {totalYearPages}
                      </span>
                      <button
                        disabled={yearPage === totalYearPages}
                        onClick={() => setYearPage((p) => Math.min(p + 1, totalYearPages))}
                        className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232938] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Próximo <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drill-down Detail Modal */}
      {selectedItem && (
        <StatsDetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          type={selectedItem.type}
          id={selectedItem.id}
          title={selectedItem.title}
        />
      )}
    </div>
  );
};
