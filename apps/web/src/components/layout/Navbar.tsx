import React from 'react';
import { Gamepad2, Trophy, Bookmark, PlusCircle, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'games' | 'backlog';
  onSelectTab: (tab: 'dashboard' | 'games' | 'backlog') => void;
  onOpenNewGame: () => void;
  onOpenNewBacklog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewGame,
  onOpenNewBacklog,
}) => {
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'backlog'
                ? 'bg-amber-500/20 text-white border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Backlog</span>
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};
