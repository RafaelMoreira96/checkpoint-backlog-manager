import React, { useMemo, useState } from 'react';
import {
  useDashboardStats,
  useLastGamesBeaten,
  useLastBacklog,
  useGamesList,
  Game,
} from '@checkpoint/core';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GamePosterCard } from '../components/games/GamePosterCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { PublicProfileModal } from '../components/profile/PublicProfileModal';
import {
  Trophy,
  Bookmark,
  Clock,
  Crown,
  CalendarCheck,
  Compass,
  ArrowRight,
  Star,
  Gamepad2,
  Sparkles,
  Flame,
  CheckCircle2,
  Tv,
  Camera,
  Globe,
  Lock,
  Sliders,
  Share2,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'games' | 'backlog' | 'stats') => void;
  onEditGame: (game: Game) => void;
  onCompleteBacklog: (game: Game) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onEditGame,
  onCompleteBacklog,
}) => {
  const { user } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPublicProfileModalOpen, setIsPublicProfileModalOpen] = useState(false);
  const { data: stats } = useDashboardStats(api);
  const { data: rawLastBeaten } = useLastGamesBeaten(api);
  const { data: rawLastBacklog } = useLastBacklog(api);
  const { data: rawAllGames } = useGamesList(api);

  const lastBeaten = useMemo(() => (Array.isArray(rawLastBeaten) ? rawLastBeaten : []), [rawLastBeaten]);
  const lastBacklog = useMemo(() => (Array.isArray(rawLastBacklog) ? rawLastBacklog : []), [rawLastBacklog]);
  const allGames = useMemo(() => (Array.isArray(rawAllGames) ? rawAllGames : []), [rawAllGames]);

  // Backloggd Favorite 4 Games Spotlight:
  // Sort games by playtime descending or take first 4 to highlight top experiences
  const favoriteFour = useMemo(() => {
    if (!allGames.length) return [];
    return [...allGames]
      .sort((a, b) => (Number(b.time_beating) || 0) - (Number(a.time_beating) || 0))
      .slice(0, 4);
  }, [allGames]);

  const username = user?.nickname || 'Jogador';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Backloggd Profile Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#161922] border border-[#232938] shadow-xl">
        {/* Cover backdrop image/gradient */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden group">
          {user?.banner_url ? (
            <img
              src={user.banner_url}
              alt="Banner de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#1e153b] via-[#161922] to-[#0c1829] relative overflow-hidden">
              {/* Subtle decorative gaming pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6c52ee_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#6c52ee]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Subtle gradient overlay to enhance text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-[#161922]/20 to-black/30 pointer-events-none" />

          {/* Quick Edit Banner button in top-right corner of cover */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5 text-[#8670ff]" />
              <span className="hidden sm:inline">Editar Fotos</span>
            </button>
          </div>
        </div>

        {/* Profile info strip */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsEditProfileOpen(true)}
              title="Clique para alterar foto de perfil"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#6c52ee] via-[#a855f7] to-[#38bdf8] p-[3px] shadow-xl shadow-black/60 overflow-hidden">
                <div className="w-full h-full bg-[#12151b] rounded-[13px] overflow-hidden flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-white">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white text-xs font-semibold backdrop-blur-[2px]">
                <Camera className="w-5 h-5 mb-0.5 text-white" />
                <span>Alterar</span>
              </div>

              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#10b981] border-2 border-[#12151b] flex items-center justify-center text-black shadow-md z-10"
                title="Status: Online"
              >
                <Sparkles className="w-4 h-4 fill-black" />
              </div>
            </div>

            {/* User Meta */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  @{username}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30">
                  Gamer Hub
                </span>
                {user?.is_public !== false ? (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30"
                    title="Seu perfil está visível para a comunidade"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Público</span>
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30"
                    title="Apenas você pode ver seus jogos zerados e estatísticas"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Privado</span>
                  </span>
                )}
              </div>

              {user?.bio ? (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-[#12141c]/60 px-3 py-1.5 rounded-xl border border-[#232938]">
                  "{user.bio}"
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-slate-400">
                  Diário gamer, registro de horas zeradas e fila de backlog
                </p>
              )}
            </div>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#6c52ee]/15 hover:bg-[#6c52ee]/25 text-[#a594fd] hover:text-white border border-[#6c52ee]/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sliders className="w-3.5 h-3.5 text-[#8670ff]" />
              <span>Editar Perfil</span>
            </button>
            <button
              onClick={() => setIsPublicProfileModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#1f2432] hover:bg-[#282f42] text-slate-200 hover:text-white border border-white/5 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Prévia de como os outros veem seu perfil"
            >
              <Share2 className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Ver Público</span>
            </button>
            <button
              onClick={() => onNavigateTab('games')}
              className="px-3.5 py-2 rounded-lg bg-[#202534] hover:bg-[#282f42] text-xs font-semibold text-slate-200 border border-white/5 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Meus Zerados</span>
            </button>
            <button
              onClick={() => onNavigateTab('backlog')}
              className="px-3.5 py-2 rounded-lg bg-[#202534] hover:bg-[#282f42] text-xs font-semibold text-slate-200 border border-white/5 transition-all flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Ver Backlog</span>
            </button>
          </div>
        </div>

        {/* 2. Iconic Backloggd Stats Counter Strip */}
        <div className="border-t border-[#232938] bg-[#12151b]/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#232938]">
          {/* Total Played */}
          <div
            onClick={() => onNavigateTab('games')}
            className="p-4 text-center hover:bg-[#181c24] transition-colors cursor-pointer group"
          >
            <div className="text-xl sm:text-2xl font-extrabold font-display text-white group-hover:text-[#10b981] transition-colors">
              {stats?.total_games_finished ?? allGames.length}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-[#10b981]" />
              <span>Jogos Zerados</span>
            </div>
          </div>

          {/* Backlog */}
          <div
            onClick={() => onNavigateTab('backlog')}
            className="p-4 text-center hover:bg-[#181c24] transition-colors cursor-pointer group"
          >
            <div className="text-xl sm:text-2xl font-extrabold font-display text-white group-hover:text-[#f59e0b] transition-colors">
              {lastBacklog.length > 0 ? `${lastBacklog.length}+` : '0'}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Bookmark className="w-3 h-3 text-[#f59e0b]" />
              <span>No Backlog</span>
            </div>
          </div>

          {/* Total Hours */}
          <div className="p-4 text-center hover:bg-[#181c24] transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold font-display text-[#38bdf8]">
              {stats?.total_hours_played ? `${Number(stats.total_hours_played).toFixed(0)}h` : '0h'}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#38bdf8]" />
              <span>Horas Totais</span>
            </div>
          </div>

          {/* This Month */}
          <div className="p-4 text-center hover:bg-[#181c24] transition-colors">
            <div className="text-xl sm:text-2xl font-extrabold font-display text-[#a855f7]">
              {stats?.games_finished_this_month ?? 0}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <CalendarCheck className="w-3 h-3 text-[#a855f7]" />
              <span>Neste Mês</span>
            </div>
          </div>

          {/* Top Genre */}
          <div
            onClick={() => onNavigateTab('stats')}
            className="p-4 text-center hover:bg-[#181c24] transition-colors cursor-pointer group"
          >
            <div className="text-sm sm:text-base font-extrabold font-display text-white truncate group-hover:text-[#8670ff] transition-colors">
              {stats?.most_used || 'N/A'}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Crown className="w-3 h-3 text-[#fbbf24]" />
              <span>Top Gênero</span>
            </div>
          </div>

          {/* Secondary Genre / Highlight */}
          <div
            onClick={() => onNavigateTab('stats')}
            className="p-4 text-center hover:bg-[#181c24] transition-colors cursor-pointer group"
          >
            <div className="text-sm sm:text-base font-extrabold font-display text-white truncate group-hover:text-rose-400 transition-colors">
              {stats?.second_most_used || 'N/A'}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-rose-400" />
              <span>2º Gênero</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Backloggd Favorite 4 Games Showcase ("Vitrine dos 4 Favoritos") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#fbbf24]" />
            <h2 className="font-display font-bold text-lg text-white">
              Destaques da Carreira &bull; Top 4
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (Jogos com mais horas dedicadas na sua biblioteca)
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('games')}
            className="text-xs font-semibold text-[#8670ff] hover:text-[#a594fd] flex items-center gap-1 transition-colors"
          >
            Ver catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {favoriteFour.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#161922] border border-[#232938] text-center text-slate-400">
            <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Nenhum destaque ainda</p>
            <p className="text-xs text-slate-400 mt-1">
              Conforme você registrar seus jogos e horas, seus títulos em destaque aparecerão aqui na vitrine!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
            {favoriteFour.map((game, index) => (
              <div key={game.id_game} className="relative group">
                {/* Ranking Medal Pill */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#12151b]/95 text-[#fbbf24] border border-[#fbbf24]/40 shadow-lg">
                    <Star className="w-2.5 h-2.5 fill-[#fbbf24]" /> #{index + 1}
                  </span>
                </div>
                <GamePosterCard
                  game={game}
                  isBacklog={false}
                  onEdit={onEditGame}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Shelves: Recently Beaten Games + Backlog Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recently Beaten Games Shelf (Left - 7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#161922] border border-[#232938] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232938]">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#10b981]" />
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Zerados Recentemente
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('games')}
              className="text-xs font-semibold text-[#10b981] hover:text-[#34d399] flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lastBeaten.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Nenhum jogo concluído recentemente. Que tal zerar seu primeiro título hoje?
            </div>
          ) : (
            <div className="space-y-3">
              {lastBeaten.map((game) => (
                <div
                  key={game.id_game}
                  onClick={() => onEditGame(game)}
                  className="flex items-center gap-3.5 p-2.5 sm:p-3 rounded-lg bg-[#12151b] border border-[#232938] hover:border-[#10b981]/40 hover:bg-[#181c25] transition-all cursor-pointer group"
                >
                  {game.url_image ? (
                    <img
                      src={game.url_image}
                      alt={game.name_game}
                      className="w-11 h-15 object-cover rounded border border-white/10 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-15 rounded bg-[#1c212d] flex items-center justify-center border border-white/10 text-slate-500 shrink-0">
                      <Tv className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white group-hover:text-[#10b981] transition-colors truncate">
                      {game.name_game}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      {game.console?.name_console && (
                        <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#38bdf8] text-[10px] font-semibold">
                          {game.console.name_console}
                        </span>
                      )}
                      {game.genre?.name_genre && (
                        <span className="text-[11px] text-slate-400 truncate">
                          {game.genre.name_genre}
                        </span>
                      )}
                      {game.date_beating && game.date_beating !== '01/01/0001' && (
                        <span className="ml-auto text-[10px] text-slate-500 font-medium">
                          {game.date_beating}
                        </span>
                      )}
                    </div>
                  </div>

                  {game.time_beating !== undefined && (
                    <div className="text-right shrink-0 pl-2">
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                        <Clock className="w-3 h-3" />
                        {game.time_beating}h
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backlog Queue Shelf (Right - 5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#161922] border border-[#232938] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232938]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#f59e0b]" />
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Fila do Backlog
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('backlog')}
              className="text-xs font-semibold text-[#f59e0b] hover:text-[#fbbf24] flex items-center gap-1 transition-colors"
            >
              Ver fila <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lastBacklog.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Sua fila de espera está vazia. Adicione novos jogos ao seu backlog!
            </div>
          ) : (
            <div className="space-y-3">
              {lastBacklog.map((game) => (
                <div
                  key={game.id_game}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#12151b] border border-[#232938] hover:border-[#f59e0b]/40 hover:bg-[#181c25] transition-all group"
                >
                  {game.url_image ? (
                    <img
                      src={game.url_image}
                      alt={game.name_game}
                      className="w-10 h-14 object-cover rounded border border-white/10 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded bg-[#1c212d] flex items-center justify-center border border-white/10 text-slate-500 shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f59e0b] transition-colors truncate">
                      {game.name_game}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {game.console?.name_console && (
                        <span className="text-[10px] text-[#38bdf8] font-semibold truncate">
                          {game.console.name_console}
                        </span>
                      )}
                      {game.genre?.name_genre && (
                        <span className="text-[10px] text-slate-500 truncate">
                          • {game.genre.name_genre}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onCompleteBacklog(game)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-[#10b981]/15 hover:bg-[#10b981] text-[#34d399] hover:text-white border border-[#10b981]/30 transition-all shrink-0"
                    title="Marcar como Zerado!"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Zerei!</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal (Bio, Privacy, Avatar and Banner) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Public Profile Preview Modal */}
      {isPublicProfileModalOpen && (
        <PublicProfileModal
          isOpen={isPublicProfileModalOpen}
          onClose={() => setIsPublicProfileModalOpen(false)}
          nickname={user?.nickname || ''}
        />
      )}
    </div>
  );
};
