import React from 'react';
import {
  Gamepad2,
  Trophy,
  Bookmark,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: 'dashboard' | 'games' | 'backlog' | 'stats';
  onSelectTab: (tab: 'dashboard' | 'games' | 'backlog' | 'stats') => void;
  onOpenNewGame: () => void;
  onOpenNewBacklog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewGame,
  onOpenNewBacklog,
}) => {
  const { user, isAuthenticated, openLogin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-obsidian-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-neon to-cyan-neon p-0.5 shadow-lg shadow-violet-glow transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-obsidian-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-violet-neon" />
            </div>
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              Check<span className="text-violet-neon">POINT</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              React Web
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-violet-neon/20 text-white border border-violet-neon/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-violet-neon" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('games')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'games'
                ? 'bg-emerald-500/20 text-white border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Zerados</span>
          </button>

          <button
            onClick={() => onSelectTab('backlog')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'backlog'
                ? 'bg-amber-500/20 text-white border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Backlog</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'stats'
                ? 'bg-cyan-500/20 text-white border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Estatísticas</span>
          </button>
        </nav>

        {/* Quick Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-glow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zerei um Jogo</span>
          </button>

          <button
            onClick={onOpenNewBacklog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 border border-white/10 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Backlog</span>
          </button>

          {/* User profile / Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  <div className="w-full h-full bg-obsidian-950 rounded-full flex items-center justify-center">
                    {user.nickname ? (
                      user.nickname.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-violet-300" />
                    )}
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                    {user.nickname}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">Gamer</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sair da Conta"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
              <button
                onClick={openLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-violet-neon" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
