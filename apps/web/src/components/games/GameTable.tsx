import React from 'react';
import { Game } from '@checkpoint/core';
import { Tv, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

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
    <div className="overflow-x-auto rounded-2xl bg-obsidian-800 border border-white/10 shadow-xl my-4">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-obsidian-950/70 text-xs uppercase font-display font-bold text-slate-400 border-b border-white/10 tracking-wider">
          <tr>
            <th className="py-3.5 px-4 w-12 text-center">#</th>
            <th className="py-3.5 px-4 w-16">Capa</th>
            <th className="py-3.5 px-4">Jogo</th>
            <th className="py-3.5 px-4">Gênero</th>
            <th className="py-3.5 px-4">Plataforma</th>
            {!isBacklog && <th className="py-3.5 px-4">Horas</th>}
            {!isBacklog && <th className="py-3.5 px-4">Data Zerado</th>}
            <th className="py-3.5 px-4 text-center w-28">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {games.map((game, idx) => (
            <tr
              key={game.id_game}
              className="hover:bg-obsidian-700/50 transition-colors"
            >
              <td className="py-3 px-4 text-center font-medium text-slate-500">
                {idx + 1}
              </td>
              <td className="py-3 px-4">
                {game.url_image ? (
                  <img
                    src={game.url_image}
                    alt={game.name_game}
                    className="w-10 h-14 object-cover rounded-lg border border-white/10 shadow"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-obsidian-950 flex items-center justify-center border border-white/10 text-slate-500">
                    <Tv className="w-5 h-5" />
                  </div>
                )}
              </td>
              <td className="py-3 px-4 font-bold text-white">
                <div>{game.name_game}</div>
                {game.developer && (
                  <div className="text-xs font-normal text-slate-400">
                    {game.developer}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-300 border border-white/10">
                  {game.genre?.name_genre || '-'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
                  {game.console?.name_console || '-'}
                </span>
              </td>
              {!isBacklog && (
                <td className="py-3 px-4 font-semibold text-amber-400">
                  {game.time_beating !== undefined ? `${game.time_beating}h` : '-'}
                </td>
              )}
              {!isBacklog && (
                <td className="py-3 px-4 text-slate-400 text-xs">
                  {!game.date_beating || game.date_beating === '01/01/0001'
                    ? '-'
                    : game.date_beating}
                </td>
              )}
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1.5">
                  {isBacklog && onComplete && (
                    <button
                      onClick={() => onComplete(game)}
                      title="Marcar como Zerado!"
                      className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(game)}
                      title="Editar"
                      className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(game.id_game)}
                      title="Excluir"
                      className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
