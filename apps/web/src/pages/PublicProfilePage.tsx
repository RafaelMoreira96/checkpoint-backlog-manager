import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { buildProfileUrl } from '../lib/profileUrl';
import {
  Globe,
  Lock,
  Trophy,
  Bookmark,
  Share2,
  Check,
  Gamepad2,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  LogIn,
  UserPlus,
  Sliders,
  Clock,
  Star,
} from 'lucide-react';

interface PublicProfilePageProps {
  nickname: string;
  onBackToHome: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isAuthenticated: boolean;
  currentUserNickname?: string;
  onOpenEditProfile?: () => void;
  onOpenPublicProfile?: (nickname: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  nickname,
  onBackToHome,
  onOpenLogin,
  onOpenRegister,
  isAuthenticated,
  currentUserNickname,
  onOpenEditProfile,
}) => {
  const [copied, setCopied] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['public-profile', nickname.toLowerCase()],
    queryFn: () => api.getPublicProfile(nickname),
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const handleCopyLink = () => {
    const url = buildProfileUrl(nickname);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const isOwnProfile =
    Boolean(currentUserNickname) &&
    currentUserNickname?.toLowerCase() === nickname.toLowerCase();

  const player = data?.player;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Bar / Navigation Context */}
      {!isAuthenticated ? (
        /* Guest Header Bar */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#161922] border border-[#232938] shadow-lg">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#202534] group-hover:bg-[#282f42] flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-300" />
            </div>
            <span>Voltar para a página inicial</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Faça login para salvar seus jogos:
            </span>
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#232938] hover:bg-[#2e3748] text-slate-200 hover:text-white border border-[#333c4f] transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#8670ff]" />
              <span>Entrar</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-md shadow-[#6c52ee]/25 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Conta</span>
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Visitor Bar */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-xl bg-[#161922] border border-[#232938]">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Globe className="w-4 h-4 text-[#8670ff]" />
            <span>
              {isOwnProfile ? (
                <>
                  Você está visualizando a prévia do seu <strong className="text-white">perfil público</strong>.
                </>
              ) : (
                <>
                  Visualizando o perfil público de <strong className="text-white">@{nickname}</strong>.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile && onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="px-3 py-1.5 rounded-lg bg-[#6c52ee]/20 hover:bg-[#6c52ee]/30 text-[#a594fd] hover:text-white border border-[#6c52ee]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#8670ff]" />
                <span>Editar Meu Perfil</span>
              </button>
            )}
            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 rounded-lg bg-[#202534] hover:bg-[#282f42] text-slate-200 hover:text-white border border-white/5 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Meu Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Loading State */}
      {isLoading && (
        <div className="py-28 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#161922] border border-[#232938]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6c52ee] to-[#38bdf8] p-[2px] shadow-xl shadow-[#6c52ee]/30 animate-pulse">
            <div className="w-full h-full bg-[#12151b] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-[#8670ff] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-white">Carregando Perfil Gamer...</p>
            <p className="text-xs text-slate-400">Buscando informações públicas de @{nickname}</p>
          </div>
        </div>
      )}

      {/* 3. Error / Not Found State */}
      {isError && !isLoading && (
        <div className="py-20 px-6 text-center rounded-2xl bg-[#161922] border border-rose-500/20 shadow-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Jogador Não Encontrado</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {(error as any)?.message ||
                `Não encontramos nenhum jogador registrado com o nickname "@${nickname}". Verifique se o link foi digitado corretamente.`}
            </p>
          </div>
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 rounded-xl bg-[#232938] hover:bg-[#2e3748] text-white text-xs font-semibold transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Início</span>
          </button>
        </div>
      )}

      {/* 4. Profile Loaded Successfully */}
      {data && player && !isLoading && (
        <div className="space-y-6">
          {/* Hero Banner & Profile Header */}
          <div className="relative rounded-2xl overflow-hidden bg-[#161922] border border-[#232938] shadow-2xl">
            {/* Banner Cover */}
            <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-gradient-to-r from-[#1e153b] via-[#161922] to-[#0c1829]">
              {player.banner_url ? (
                <img
                  src={player.banner_url}
                  alt={`Banner de @${player.nickname}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6c52ee_1px,transparent_1px)] [background-size:18px_18px]" />
                  <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#6c52ee]/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-[#161922]/30 to-black/25 pointer-events-none" />

              {/* Share button in top corner of banner */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95"
                  title="Copiar link direto para este perfil"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>Compartilhar Perfil</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Info Bar */}
            <div className="px-6 sm:px-8 pb-7 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-14 sm:-mt-16">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#6c52ee] via-[#a855f7] to-[#38bdf8] p-[3px] shadow-2xl shadow-black/80 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-[#12151b] rounded-[13px] overflow-hidden flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-white">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      player.nickname.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Nickname, Name & Badges */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                      @{player.nickname}
                    </h1>

                    {isOwnProfile && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30">
                        Seu Perfil
                      </span>
                    )}

                    {data.is_private ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30">
                        <Lock className="w-3 h-3" />
                        <span>Perfil Privado</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                        <Globe className="w-3 h-3" />
                        <span>Perfil Público</span>
                      </span>
                    )}
                  </div>

                  {player.name_player && (
                    <p className="text-sm font-semibold text-slate-300">
                      {player.name_player}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-[#202534] hover:bg-[#282f42] text-slate-200 hover:text-white border border-white/5 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                {isOwnProfile && onOpenEditProfile && (
                  <button
                    onClick={onOpenEditProfile}
                    className="px-4 py-2 rounded-xl bg-[#6c52ee] hover:bg-[#5b40e2] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#6c52ee]/25"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Editar Perfil</span>
                  </button>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={onOpenRegister}
                    className="px-4 py-2 rounded-xl bg-[#6c52ee] hover:bg-[#5b40e2] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#6c52ee]/25"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Criar Minha Conta</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="px-6 sm:px-8 pb-7">
              {player.bio ? (
                <div className="p-4 sm:p-5 rounded-xl bg-[#12141c] border border-[#232938] space-y-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#8670ff]" />
                    <span>Sobre o Jogador</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "{player.bio}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Este jogador ainda não adicionou uma biografia.
                </p>
              )}
            </div>
          </div>

          {/* 5. Conditional: Private Profile Notice */}
          {data.is_private ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">Perfil Privado</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {data.message ||
                    'Este perfil é privado. As estatísticas e biblioteca de jogos estão visíveis apenas para o proprietário.'}
                </p>
              </div>
              {!isAuthenticated && (
                <div className="pt-2">
                  <button
                    onClick={onOpenLogin}
                    className="px-4 py-2 rounded-xl bg-[#232938] hover:bg-[#2e3748] text-white text-xs font-semibold transition-all inline-flex items-center gap-2 border border-[#333c4f]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Esta conta é sua? Faça login para visualizá-la</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 6. Public Statistics & Games */
            <div className="space-y-6">
              {/* Stat Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#161922] border border-[#232938] flex items-center gap-4 shadow-lg hover:border-[#10b981]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">
                      {data.quantity_finished_games ?? 0}
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      Jogos Zerados
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#161922] border border-[#232938] flex items-center gap-4 shadow-lg hover:border-[#f59e0b]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center shrink-0 border border-[#f59e0b]/20">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">
                      {data.quantity_backlog_games ?? 0}
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      Fila do Backlog
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#161922] border border-[#232938] flex items-center gap-4 shadow-lg sm:col-span-2 lg:col-span-1 hover:border-[#6c52ee]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#6c52ee]/15 text-[#8670ff] flex items-center justify-center shrink-0 border border-[#6c52ee]/20">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">
                      {(data.quantity_finished_games ?? 0) + (data.quantity_backlog_games ?? 0)}
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      Total Catalogado
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Beaten Games Showcase */}
              <div className="rounded-2xl bg-[#161922] border border-[#232938] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#232938] pb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#10b981]" />
                    <h3 className="font-display font-bold text-base text-white">
                      Títulos Zerados Recentemente
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {data.recent_games?.length || 0} títulos exibidos
                  </span>
                </div>

                {data.recent_games && data.recent_games.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {data.recent_games.map((game: any) => (
                      <div
                        key={game.id_game}
                        className="rounded-xl overflow-hidden bg-[#12141c] border border-[#232938] group hover:border-[#6c52ee]/50 transition-all duration-200 flex flex-col shadow-md hover:shadow-xl hover:shadow-[#6c52ee]/10"
                      >
                        {/* Poster 3:4 */}
                        <div className="aspect-[3/4] w-full bg-[#181d29] relative overflow-hidden">
                          {game.url_image ? (
                            <img
                              src={game.url_image}
                              alt={game.name_game}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-2 text-center">
                              <Gamepad2 className="w-8 h-8 mb-1 opacity-40" />
                              <span className="text-[10px] line-clamp-2">{game.name_game}</span>
                            </div>
                          )}

                          {/* Gradient shadow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            {game.rating > 0 && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-bold text-[#fbbf24] border border-amber-400/20">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>{game.rating}</span>
                              </span>
                            )}
                          </div>

                          {/* Bottom info on poster */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#a594fd] transition-colors">
                              {game.name_game}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                              <span className="truncate max-w-[70%]">
                                {game.console?.name_console || 'Multi'}
                              </span>
                              {game.time_beating > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-300 shrink-0">
                                  <Clock className="w-2.5 h-2.5 text-[#10b981]" />
                                  <span>{game.time_beating}h</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Gamepad2 className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
                    <p className="text-xs font-semibold text-slate-400">
                      Nenhum jogo zerado registrado recentemente por este jogador.
                    </p>
                  </div>
                )}
              </div>

              {/* 7. Call To Action for Guests */}
              {!isAuthenticated && (
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#191530] via-[#161922] to-[#121c2c] border border-[#2d2552] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8670ff]">
                      Junte-se à Comunidade Gamer
                    </span>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                      Crie o seu próprio diário e gerencie seu backlog
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Assim como @{player.nickname}, você pode catalogar seus jogos zerados, registrar horas, organizar sua fila e compartilhar seu perfil público.
                    </p>
                  </div>
                  <button
                    onClick={onOpenRegister}
                    className="px-5 py-2.5 rounded-xl bg-[#6c52ee] hover:bg-[#5b40e2] text-white text-xs font-bold transition-all shadow-lg shadow-[#6c52ee]/30 shrink-0 hover:scale-105 active:scale-95"
                  >
                    Criar Meu Perfil Grátis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
