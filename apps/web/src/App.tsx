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
import { LandingPage } from './pages/LandingPage';
import { GameFormModal } from './components/games/GameFormModal';
import { ImportCSVModal } from './components/games/ImportCSVModal';
import { AuthModal } from './components/auth/AuthModal';
import { Gamepad2 } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, openLogin, openRegister } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'games' | 'backlog' | 'stats'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  const handleOpenImportCSV = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setIsImportModalOpen(true);
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

  // 1. Loading splash screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#12151b] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6c52ee] to-[#38bdf8] p-[2px] shadow-lg shadow-[#6c52ee]/25 animate-pulse">
            <div className="w-full h-full bg-[#12151b] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-[#8670ff]" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Carregando CheckPOINT...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenLogin={openLogin} onOpenRegister={openRegister} />
        <AuthModal />
      </>
    );
  }

  // 3. Authenticated: Full Backloggd-inspired Gamer App
  return (
    <div className="min-h-screen bg-[#12151b] text-slate-100 flex flex-col font-sans selection:bg-[#6c52ee] selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewGame={handleOpenNewGame}
        onOpenNewBacklog={handleOpenNewBacklog}
        onOpenImportCSV={handleOpenImportCSV}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
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
            onOpenImportCSV={handleOpenImportCSV}
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

      <footer className="border-t border-[#232938] bg-[#0d1015] py-7 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span className="font-extrabold text-white">Check<span className="text-[#8670ff]">POINT</span></span>
            <span>&bull; Diário Gamer & Gestão de Backlog &bull; Inspirado no Backloggd</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by React, GoFiber & IGDB &bull; 2026
          </p>
        </div>
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

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <AuthModal />
    </div>
  );
};
