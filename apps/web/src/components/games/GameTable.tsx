import React from 'react';
import { Game } from '@checkpoint/core';
import { Tv, Edit2, Trash2, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface GameTableProps {
  games: Game[];
  isBacklog?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (id: number) => void;
  onComplete?: (game: Game) => void;
}

export const GameTable: React.FC<GameTableProps> = ({
  games,
  isBacklog = false,
  onEdit,
  onDelete,
  onComplete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl bg-[#161922] border border-[#232938] shadow-lg my-2">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-[#12151b] text-[11px] uppercase font-bold text-slate-400 border-b border-[#232938] tracking-wider">
          <tr>
            <th className="py-3 px-3 w-10 text-center">#</th>
            <th className="py-3 px-3 w-14">Capa</th>
            <th className="py-3 px-4">Título</th>
            <th className="py-3 px-4">Gênero</th>
            <th className="py-3 px-4">Plataforma</th>
            {!isBacklog && <th className="py-3 px-4">Tempo</th>}
            {!isBacklog && <th className="py-3 px-4">Data Zerado</th>}
            <th className="py-3 px-4 text-right w-24">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#202534]">
          {games.map((game, idx) => (
            <tr
              key={game.id_game}
              className="hover:bg-[#1c212d] transition-colors group"
            >
              <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-500">
                {idx + 1}
              </td>
              <td className="py-2.5 px-3">
                {game.url_image ? (
                  <img
                    src={game.url_image}
                    alt={game.name_game}
                    className="w-9 h-12 object-cover rounded border border-white/10 shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-9 h-12 rounded bg-[#101319] flex items-center justify-center border border-white/10 text-slate-500">
                    <Tv className="w-4 h-4" />
                  </div>
                )}
              </td>
              <td className="py-2.5 px-4 font-semibold text-white">
                <div className="group-hover:text-[#8670ff] transition-colors">{game.name_game}</div>
                <div className="flex items-center gap-2 text-[11px] font-normal text-slate-400 mt-0.5">
                  {game.release_year && <span>{game.release_year}</span>}
                  {game.developer && <span>• {game.developer}</span>}
                </div>
              </td>
              <td className="py-2.5 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-[#202534] text-slate-300 border border-white/5">
                  {game.genre?.name_genre || '-'}
                </span>
              </td>
              <td className="py-2.5 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/20">
                  {game.console?.name_console || '-'}
                </span>
              </td>
              {!isBacklog && (
                <td className="py-2.5 px-4">
                  {game.time_beating !== undefined ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#fbbf24] text-xs">
                      <Clock className="w-3 h-3 text-[#fbbf24]" />
                      {game.time_beating}h
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              )}
              {!isBacklog && (
                <td className="py-2.5 px-4 text-slate-400 text-xs">
                  {!game.date_beating || game.date_beating === '01/01/0001' ? (
                    '-'
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {game.date_beating}
                    </span>
                  )}
                </td>
              )}
              <td className="py-2.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  {isBacklog && onComplete && (
                    <button
                      onClick={() => onComplete(game)}
                      title="Marcar como Zerado!"
                      className="px-2 py-1 rounded bg-[#10b981]/20 hover:bg-[#10b981] text-[#34d399] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zerei</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(game)}
                      title="Editar"
                      className="w-7 h-7 rounded bg-[#202534] hover:bg-[#6c52ee] text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(game.id_game)}
                      title="Excluir"
                      className="w-7 h-7 rounded bg-[#202534] hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
