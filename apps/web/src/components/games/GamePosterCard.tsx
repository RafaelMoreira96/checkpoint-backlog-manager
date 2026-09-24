import React from 'react';
import { Game } from '@checkpoint/core';
import { Trophy, Bookmark, Clock, Tv, Tag, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface GamePosterCardProps {
  game: Game;
  isBacklog?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (id: number) => void;
  onComplete?: (game: Game) => void;
}

export const GamePosterCard: React.FC<GamePosterCardProps> = ({
  game,
  isBacklog = false,
  onEdit,
  onDelete,
  onComplete,
}) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-obsidian-800 border border-white/10 aspect-[3/4] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-neon/50 hover:shadow-2xl hover:shadow-violet-glow cursor-pointer flex flex-col">
      {/* Floating Status Badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        {isBacklog ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white backdrop-blur-md border border-amber-400/40 shadow-md">
            <Bookmark className="w-3 h-3" /> Backlog
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md border border-emerald-400/40 shadow-md">
            <Trophy className="w-3 h-3" /> Zerado
          </span>
        )}
      </div>

      {/* Floating Time Pill */}
      {game.time_beating !== undefined && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-obsidian-950/80 text-cyan-400 border border-white/10 backdrop-blur-md">
            <Clock className="w-3 h-3" /> {game.time_beating}h
          </span>
        </div>
      )}

      {/* Poster Image / Placeholder */}
      {game.url_image ? (
        <img
          src={game.url_image}
          alt={game.name_game}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-obsidian-800 to-obsidian-950 p-4 text-center">
          <Tv className="w-10 h-10 text-violet-neon/70 mb-2" />
          <span className="text-xs font-semibold text-slate-300 line-clamp-2">
            {game.name_game}
          </span>
        </div>
      )}

      {/* Bottom Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/80 to-transparent z-20 flex flex-col justify-end p-3.5 transition-opacity duration-300">
        <h3
          className="font-display font-bold text-sm text-white mb-1.5 line-clamp-2 leading-tight"
          title={game.name_game}
        >
          {game.name_game}
        </h3>

        {/* Metadata Pills */}
        <div className="flex flex-wrap gap-1 mb-2">
          {game.console?.name_console && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-200 border border-white/5">
              <Tv className="w-2.5 h-2.5 text-cyan-400" />
              {game.console.name_console}
            </span>
          )}
          {game.genre?.name_genre && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-200 border border-white/5">
              <Tag className="w-2.5 h-2.5 text-amber-400" />
              {game.genre.name_genre}
            </span>
          )}
          {game.release_year && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-400">
              {game.release_year}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          {isBacklog && onComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(game);
              }}
              title="Marcar como Zerado!"
              className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(game);
              }}
              title="Editar"
              className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game.id_game);
              }}
              title="Excluir"
              className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
