import React from 'react';
import { Game } from '@checkpoint/core';
import { GamePosterCard } from './GamePosterCard';
import { Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  isBacklog?: boolean;
  searchTerm?: string;
  onEdit?: (game: Game) => void;
  onDelete?: (id: number) => void;
  onComplete?: (game: Game) => void;
  onAddFirst?: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  isBacklog = false,
  searchTerm = '',
  onEdit,
  onDelete,
  onComplete,
  onAddFirst,
}) => {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-obsidian-800 border border-white/5 my-6">
        <Gamepad2 className="w-16 h-16 text-slate-600 mb-4 animate-pulse" />
        <h4 className="text-lg font-bold text-white mb-2">
          {searchTerm ? 'Nenhum jogo encontrado' : isBacklog ? 'Backlog vazio' : 'Nenhum jogo zerado registrado'}
        </h4>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {searchTerm
            ? `Nenhum título corresponde à busca "${searchTerm}". Tente outros termos.`
            : isBacklog
            ? 'Você ainda não adicionou nenhum jogo à sua fila de backlog.'
            : 'Sua lista de conquistas ainda está vazia. Adicione os jogos que você já concluiu!'}
        </p>
        {!searchTerm && onAddFirst && (
          <button
            onClick={onAddFirst}
            className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-violet-neon to-purple-600 text-white shadow-lg shadow-violet-glow hover:opacity-90 transition-all"
          >
            {isBacklog ? 'Adicionar ao Backlog' : 'Registrar Primeiro Jogo'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 py-4">
      {games.map((game) => (
        <GamePosterCard
          key={game.id_game}
          game={game}
          isBacklog={isBacklog}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};
