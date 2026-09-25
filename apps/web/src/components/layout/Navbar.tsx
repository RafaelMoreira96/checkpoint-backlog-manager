import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  Bookmark,
  Plus,
  BarChart3,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: 'dashboard' | 'games' | 'backlog' | 'stats';
  onSelectTab: (tab: 'dashboard' | 'games' | 'backlog' | 'stats') => void;
  onOpenNewGame: () => void;
  onOpenNewBacklog: () => void;
  onOpenImportCSV?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewGame,
  onOpenNewBacklog,
  onOpenImportCSV,
}) => {
  const { user, isAuthenticated, openLogin, logout } = useAuth();
  const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);
  const logMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logMenuRef.current && !logMenuRef.current.contains(event.target as Node)) {
        setIsLogMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#12151b]/95 backdrop-blur-md border-b border-[#222836] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo - Backloggd aesthetic */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#6c52ee] to-[#4834b8] p-[1.5px] shadow-lg shadow-[#6c52ee]/25 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#12151b] rounded-[7px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-[#8670ff]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Check<span className="text-[#7d66f6]">POINT</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30 hidden sm:inline-block">
                Backloggd Edition
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links - Backloggd style */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#1e2330] text-white border border-[#333b4e] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#8670ff]" />
            <span className="hidden md:inline">Perfil & Hub</span>
            <span className="md:hidden">Hub</span>
          </button>

          <button
            onClick={() => onSelectTab('games')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'games'
                ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#10b981]" />
            <span>Zerados</span>
          </button>

          <button
            onClick={() => onSelectTab('backlog')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'backlog'
                ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#f59e0b]" />
            <span>Backlog</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'stats'
                ? 'bg-[#0ea5e9]/15 text-[#38bdf8] border border-[#0ea5e9]/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#0ea5e9]" />
            <span className="hidden sm:inline">Estatísticas</span>
            <span className="sm:hidden">Stats</span>
          </button>
        </nav>

        {/* Quick Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Backloggd Iconic "+ Log / Add Game" Button */}
          <div className="relative" ref={logMenuRef}>
            <button
              onClick={() => setIsLogMenuOpen(!isLogMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-md shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="tracking-wide uppercase text-[11px] font-extrabold hidden xs:inline">
                Registrar
              </span>
              <ChevronDown className="w-3 h-3 text-violet-200 transition-transform duration-200" />
            </button>

            {/* Dropdown Options */}
            {isLogMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#181c24] border border-[#2b3345] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsLogMenuOpen(false);
                    onOpenNewGame();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#10b981]/15 hover:text-[#34d399] transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Zerei um Jogo</div>
                    <div className="text-[10px] text-slate-400">Registrar horas e data</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsLogMenuOpen(false);
                    onOpenNewBacklog();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#f59e0b]/15 hover:text-[#fbbf24] transition-colors text-left mt-1"
                >
                  <div className="w-6 h-6 rounded-md bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                    <Bookmark className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Adicionar ao Backlog</div>
                    <div className="text-[10px] text-slate-400">Colocar na fila de espera</div>
                  </div>
                </button>

                {onOpenImportCSV && (
                  <button
                    onClick={() => {
                      setIsLogMenuOpen(false);
                      onOpenImportCSV();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#6c52ee]/15 hover:text-[#8b77f7] transition-colors text-left mt-1 pt-2 border-t border-[#232938]"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#6c52ee]/20 flex items-center justify-center text-[#8b77f7]">
                      <UploadCloud className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Importar via CSV</div>
                      <div className="text-[10px] text-slate-400">Upload em lote</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#222836]">
              <div
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 cursor-pointer group"
                title="Meu Perfil"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6c52ee] to-[#38bdf8] p-[1.5px] shadow-sm overflow-hidden">
                  <div className="w-full h-full bg-[#12151b] rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white group-hover:bg-[#181c24] transition-colors">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : user.nickname ? (
                      user.nickname.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-[#8670ff]" />
                    )}
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[90px] group-hover:text-[#8670ff] transition-colors">
                    @{user.nickname}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">Membro</p>
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
            <div className="flex items-center gap-2 pl-2 border-l border-[#222836]">
              <button
                onClick={openLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1e2330] hover:bg-[#252c3d] text-[#a594fd] border border-[#333b4e] hover:border-[#6c52ee]/50 transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-[#8670ff]" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
