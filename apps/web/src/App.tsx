import React, { useState } from 'react';
import {
  Game,
  CreateGameDto,
  useCreateGame,
  useUpdateGame,
  useCreateBacklog,
} from '@checkpoint/core';
import { api } from './lib/api';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { BeatenGamesPage } from './pages/BeatenGamesPage';
import { BacklogPage } from './pages/BacklogPage';
import { StatsPage } from './pages/StatsPage';
import { GameFormModal } from './components/games/GameFormModal';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  const { isAuthenticated, openLogin } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'games' | 'backlog' | 'stats'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIsBacklog, setModalIsBacklog] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Mutations
  const createGameMutation = useCreateGame(api);
  const updateGameMutation = useUpdateGame(api);
  const createBacklogMutation = useCreateBacklog(api);

  const handleOpenNewGame = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setEditingGame(null);
    setModalIsBacklog(false);
    setIsModalOpen(true);
  };

  const handleOpenNewBacklog = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setEditingGame(null);
    setModalIsBacklog(true);
    setIsModalOpen(true);
  };

  const handleEditGame = (game: Game) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setEditingGame(game);
    setModalIsBacklog(currentTab === 'backlog');
    setIsModalOpen(true);
  };

  const handleCompleteBacklog = async (game: Game) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    // Open modal to register hours and completion date, then delete from backlog on submit
    setEditingGame({
      ...game,
      time_beating: 10,
      date_beating: new Date().toISOString().split('T')[0],
    });
    setModalIsBacklog(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (dto: CreateGameDto) => {
    if (editingGame) {
      if (modalIsBacklog) {
        await createBacklogMutation.mutateAsync(dto);
      } else {
        await updateGameMutation.mutateAsync({
          id: editingGame.id_game,
          data: {
            ...dto,
            id_game: editingGame.id_game,
          },
        });
      }
    } else {
      if (modalIsBacklog) {
        await createBacklogMutation.mutateAsync(dto);
      } else {
        await createGameMutation.mutateAsync(dto);
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewGame={handleOpenNewGame}
        onOpenNewBacklog={handleOpenNewBacklog}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigateTab={setCurrentTab}
            onEditGame={handleEditGame}
            onCompleteBacklog={handleCompleteBacklog}
          />
        )}

        {currentTab === 'games' && (
          <BeatenGamesPage
            onOpenNewGame={handleOpenNewGame}
            onEditGame={handleEditGame}
          />
        )}

        {currentTab === 'backlog' && (
          <BacklogPage
            onOpenNewBacklog={handleOpenNewBacklog}
            onEditBacklog={handleEditGame}
            onCompleteBacklog={handleCompleteBacklog}
          />
        )}

        {currentTab === 'stats' && <StatsPage />}
      </main>

      <footer className="border-t border-white/5 bg-obsidian-950/60 py-6 text-center text-xs text-slate-500">
        <p>CheckPOINT &bull; Plataforma Gamer de Backlog e Jogos Zerados &bull; React Web 2026</p>
      </footer>

      {isModalOpen && (
        <GameFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialGame={editingGame}
          isBacklog={modalIsBacklog}
        />
      )}

      <AuthModal />
    </div>
  );
};
