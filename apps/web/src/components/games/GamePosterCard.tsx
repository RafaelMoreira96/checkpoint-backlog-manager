import React, { useState } from 'react';
import { Game } from '@checkpoint/core';
import {
  Trophy,
  Bookmark,
  Clock,
  Tv,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
} from 'lucide-react';

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
  const [imageError, setImageError] = useState(false);

  // Generate a consistent pseudo-rating based on id for visual flair (like Backloggd 4.5 ★ rating)
  const pseudoRating = ((game.id_game * 7) % 3) + 3.5;

  return (
    <div className="group relative flex flex-col cursor-pointer transition-all duration-200">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#181c24] border border-[#252c3c] shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#6c52ee]/80 group-hover:shadow-xl group-hover:shadow-[#6c52ee]/20">
        {/* Top-Left Status Ribbon / Badge */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          {isBacklog ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#f59e0b]/90 text-black backdrop-blur-md shadow-sm">
              <Bookmark className="w-2.5 h-2.5 stroke-[3]" /> Backlog
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#10b981]/90 text-black backdrop-blur-md shadow-sm">
              <Trophy className="w-2.5 h-2.5 stroke-[3]" /> Zerado
            </span>
          )}
        </div>

        {/* Top-Right Playtime Pill */}
        {game.time_beating !== undefined && Number(game.time_beating) > 0 && (
          <div className="absolute top-2 right-2 z-20 pointer-events-none">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#12151b]/90 text-[#38bdf8] border border-white/10 backdrop-blur-md">
              <Clock className="w-3 h-3 text-[#38bdf8]" />
              {game.time_beating}h
            </span>
          </div>
        )}

        {/* Cover Image */}
        {game.url_image && !imageError ? (
          <img
            src={game.url_image}
            alt={game.name_game}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#181c24] to-[#12151b] p-4 text-center border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#202634] flex items-center justify-center mb-2 text-[#6c52ee]">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-300 line-clamp-3 leading-snug">
              {game.name_game}
            </span>
            {game.console?.name_console && (
              <span className="text-[10px] text-[#38bdf8] mt-1 font-semibold">
                {game.console.name_console}
              </span>
            )}
          </div>
        )}

        {/* Backloggd Dark Overlay on Hover with Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101319] via-[#101319]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex flex-col justify-end p-3 pointer-events-auto">
          {/* Quick Details */}
          <div className="mb-2">
            <h4 className="font-bold text-xs text-white line-clamp-2 leading-tight">
              {game.name_game}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
              {game.release_year && <span>{game.release_year}</span>}
              {game.console?.name_console && (
                <>
                  <span>•</span>
                  <span className="text-[#38bdf8] truncate max-w-[100px]">
                    {game.console.name_console}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            {/* Quick Complete if Backlog */}
            {isBacklog && onComplete ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(game);
                }}
                title="Marcar como Zerado!"
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#10b981] hover:bg-[#059669] text-white text-[10px] font-bold shadow transition-all"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Zerei!</span>
              </button>
            ) : (
              <div className="flex items-center gap-0.5 text-[#fbbf24] text-[10px] font-bold">
                <Star className="w-3 h-3 fill-[#fbbf24]" />
                <span>{pseudoRating.toFixed(1)}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(game);
                  }}
                  title="Editar dados"
                  className="w-6 h-6 rounded bg-white/10 hover:bg-[#6c52ee] text-slate-300 hover:text-white flex items-center justify-center transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(game.id_game);
                  }}
                  title="Remover"
                  className="w-6 h-6 rounded bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Under-Card Metadata (Backloggd clean style) */}
      <div className="mt-2 px-0.5">
        <h3
          className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors truncate"
          title={game.name_game}
        >
          {game.name_game}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
          <span className="truncate max-w-[110px]">
            {game.console?.name_console || (game.release_year ? `${game.release_year}` : '')}
          </span>
          {game.genre?.name_genre && (
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[80px]">
              {game.genre.name_genre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
