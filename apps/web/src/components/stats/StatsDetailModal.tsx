import React from 'react';
import { useStatsByItem } from '@checkpoint/core';
import { api } from '../../lib/api';
import { X, Trophy, Sparkles, Loader2, Calendar, Tv, Tag } from 'lucide-react';

interface StatsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'genre' | 'console' | 'year' | null;
  id: number | null;
  title: string;
}

export const StatsDetailModal: React.FC<StatsDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  id,
  title,
}) => {
  const { data: detail, isLoading, isError } = useStatsByItem(type, id, api);

  if (!isOpen || !type || !id) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-obsidian-850 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-obsidian-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-neon">
              {type === 'genre' && <Tag className="w-5 h-5 text-amber-400" />}
              {type === 'console' && <Tv className="w-5 h-5 text-cyan-400" />}
              {type === 'year' && <Calendar className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {type === 'genre' ? 'Estatísticas por Gênero' : type === 'console' ? 'Estatísticas por Plataforma' : 'Estatísticas por Ano de Lançamento'}
              </span>
              <h3 className="text-xl font-bold font-display text-white">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-neon mb-3" />
              <p className="text-sm">Carregando detalhes gamísticos...</p>
            </div>
          ) : isError || !detail ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              Não foi possível carregar os detalhes deste item.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Zerados</span>
                  <div className="text-2xl font-display font-extrabold text-white mt-1">
                    {detail.totalGamesFinished}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo Total</span>
                  <div className="text-2xl font-display font-extrabold text-emerald-400 mt-1">
                    {Number(detail.totalHoursPlayed || 0).toFixed(1)}h
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo Médio</span>
                  <div className="text-2xl font-display font-extrabold text-cyan-400 mt-1">
                    {Number(detail.averageTimeBeating || 0).toFixed(1)}h
                  </div>
                </div>
              </div>

              {/* Highlights (Maior / Menor Duração) */}
              {detail.highlightGames && detail.highlightGames.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-neon" />
                    Destaques Gamísticos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.highlightGames.map((h, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                            {h.TypeItem}
                          </span>
                          <h5 className="font-bold text-sm text-white truncate">{h.NameGame}</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-violet-500/30 text-violet-200 border border-violet-500/30 shrink-0">
                          {h.TimeBeating}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Games Table/List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  Jogos Registrados ({detail.listGame?.length || 0})
                </h4>

                {(!detail.listGame || detail.listGame.length === 0) ? (
                  <p className="text-center py-6 text-slate-500 text-sm">
                    Nenhum jogo encontrado nesta categoria.
                  </p>
                ) : (
                  <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5 bg-obsidian-900">
                    {detail.listGame.map((game, i) => (
                      <div
                        key={i}
                        className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="font-bold text-sm text-white truncate">{game.NameGame}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {game.Console && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-400">
                                {game.Console}
                              </span>
                            )}
                            {game.Genre && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-400">
                                {game.Genre}
                              </span>
                            )}
                            {game.ReleaseYear && (
                              <span className="text-slate-500">{game.ReleaseYear}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-bold text-emerald-400 shrink-0">
                          {game.TimeBeating}h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-obsidian-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
