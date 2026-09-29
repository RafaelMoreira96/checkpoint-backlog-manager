import React from 'react';
import { Game } from '@checkpoint/core';
import { GamePosterCard } from './GamePosterCard';
import { Gamepad2, Plus } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-[#161922] border border-[#232938] my-6">
        <div className="w-16 h-16 rounded-2xl bg-[#6c52ee]/10 border border-[#6c52ee]/20 flex items-center justify-center mb-4 text-[#8670ff] shadow-inner">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1.5 font-display">
          {searchTerm ? 'Nenhum jogo encontrado' : isBacklog ? 'Fila do Backlog Vazia' : 'Nenhum Jogo Zerado Registrado'}
        </h4>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          {searchTerm
            ? `Nenhum título corresponde aos filtros ou à busca "${searchTerm}". Experimente buscar por outro nome ou limpar os filtros.`
            : isBacklog
            ? 'Sua lista de espera está zerada. Adicione os jogos que você planeja jogar para organizar suas jogatinas!'
            : 'Sua estante de conquistas ainda está vazia. Registre seus jogos concluídos, tempo dedicado e data de zeramento!'}
        </p>
        {!searchTerm && onAddFirst && (
          <button
            onClick={onAddFirst}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-lg shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isBacklog ? 'Adicionar ao Backlog' : 'Registrar Primeiro Jogo'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 py-2">
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
