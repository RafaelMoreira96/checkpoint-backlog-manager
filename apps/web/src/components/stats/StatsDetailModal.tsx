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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#161922] border border-[#262d3d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6c52ee]/15 border border-[#6c52ee]/30 flex items-center justify-center text-[#8670ff]">
              {type === 'genre' && <Tag className="w-5 h-5 text-[#f59e0b]" />}
              {type === 'console' && <Tv className="w-5 h-5 text-[#38bdf8]" />}
              {type === 'year' && <Calendar className="w-5 h-5 text-[#10b981]" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {type === 'genre'
                  ? 'Estatísticas por Gênero'
                  : type === 'console'
                  ? 'Estatísticas por Plataforma'
                  : 'Estatísticas por Ano de Lançamento'}
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6c52ee] mb-3" />
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
                <div className="p-4 rounded-xl bg-[#12151b] border border-[#232938] flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Zerados
                  </span>
                  <div className="text-2xl font-display font-extrabold text-white mt-1">
                    {detail.totalGamesFinished}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#12151b] border border-[#232938] flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tempo Total
                  </span>
                  <div className="text-2xl font-display font-extrabold text-[#10b981] mt-1">
                    {Number(detail.totalHoursPlayed || 0).toFixed(1)}h
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#12151b] border border-[#232938] flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tempo Médio
                  </span>
                  <div className="text-2xl font-display font-extrabold text-[#38bdf8] mt-1">
                    {Number(detail.averageTimeBeating || 0).toFixed(1)}h
                  </div>
                </div>
              </div>

              {/* Highlights (Maior / Menor Duração) */}
              {detail.highlightGames && detail.highlightGames.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8670ff]" />
                    Destaques Gamísticos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.highlightGames.map((h, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-[#1d222e] border border-[#2f384c] flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#a594fd]">
                            {h.TypeItem}
                          </span>
                          <h5 className="font-bold text-sm text-white truncate">{h.NameGame}</h5>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#6c52ee]/30 text-violet-200 border border-[#6c52ee]/40 shrink-0">
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
                  <Trophy className="w-3.5 h-3.5 text-[#10b981]" />
                  Jogos Registrados ({detail.listGame?.length || 0})
                </h4>

                {!detail.listGame || detail.listGame.length === 0 ? (
                  <p className="text-center py-6 text-slate-500 text-sm">
                    Nenhum jogo encontrado nesta categoria.
                  </p>
                ) : (
                  <div className="rounded-xl border border-[#232938] overflow-hidden divide-y divide-[#232938] bg-[#12151b]">
                    {detail.listGame.map((game, i) => (
                      <div
                        key={i}
                        className="p-3.5 flex items-center justify-between hover:bg-[#181c25] transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="font-bold text-sm text-white truncate">
                            {game.NameGame}
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                            {game.Console && (
                              <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#38bdf8] text-[10px] font-semibold">
                                {game.Console}
                              </span>
                            )}
                            {game.Genre && (
                              <span className="text-slate-400 text-[10px]">
                                • {game.Genre}
                              </span>
                            )}
                            {game.ReleaseYear && (
                              <span className="text-slate-500 text-[10px]">
                                • Lançamento {game.ReleaseYear}
                              </span>
                            )}
                            {game.DateBeating && game.DateBeating !== '01/01/0001' && (
                              <span className="text-slate-400 text-[10px] flex items-center gap-1 sm:hidden">
                                • {game.DateBeating}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1 pl-3 text-right">
                          <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                            {game.TimeBeating}h
                          </span>
                          {game.DateBeating && game.DateBeating !== '01/01/0001' && (
                            <span className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#10b981]" />
                              Zerado em {game.DateBeating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#232938] bg-[#12151b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
