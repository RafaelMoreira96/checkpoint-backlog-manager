import React, { useEffect, useState } from 'react';
import { PublicProfileResponse } from '@checkpoint/core';
import { api } from '../../lib/api';
import {
  X,
  Lock,
  Globe,
  Trophy,
  Bookmark,
  Sparkles,
  Share2,
  Check,
  Loader2,
  Gamepad2,
  AlertCircle,
} from 'lucide-react';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  isOpen,
  onClose,
  nickname,
}) => {
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && nickname) {
      setIsLoading(true);
      setError(null);
      setCopied(false);

      api.getPublicProfile(nickname)
        .then((res) => {
          setData(res);
        })
        .catch((err: any) => {
          setError(err.message || 'Não foi possível carregar o perfil.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, nickname]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?player=${encodeURIComponent(nickname)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const player = data?.player;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#161922] border border-[#262d3d] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#6c52ee]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Visualização de Perfil Público
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#232938] hover:bg-[#2e3748] text-slate-200 hover:text-white border border-[#333c4f] transition-all"
              title="Copiar link direto para este perfil"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[#10b981]">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Compartilhar</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#6c52ee]" />
              <p className="text-xs text-slate-400">Carregando dados do perfil...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Perfil não encontrado</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          ) : data && player ? (
            <div>
              {/* Cover Banner */}
              <div className="h-40 w-full relative overflow-hidden bg-gradient-to-r from-[#1e153b] via-[#161922] to-[#0c1829]">
                {player.banner_url ? (
                  <img
                    src={player.banner_url}
                    alt="Banner de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full opacity-20 bg-[radial-gradient(#6c52ee_1px,transparent_1px)] [background-size:16px_16px]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-[#161922]/30 to-black/20" />
              </div>

              {/* Profile Bar */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#6c52ee] via-[#a855f7] to-[#38bdf8] p-[3px] shadow-xl overflow-hidden shrink-0">
                    <div className="w-full h-full bg-[#12151b] rounded-[13px] overflow-hidden flex items-center justify-center font-display font-extrabold text-3xl text-white">
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

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="font-display font-extrabold text-2xl text-white">
                        @{player.nickname}
                      </h2>
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
                      <p className="text-xs text-slate-400 font-medium">
                        {player.name_player}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="px-6 pb-6">
                {player.bio ? (
                  <div className="p-4 rounded-xl bg-[#12141c] border border-[#232938] space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#8670ff]" />
                      <span>Sobre o Jogador</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{player.bio}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Este jogador ainda não adicionou uma biografia.
                  </p>
                )}
              </div>

              {/* If Private: Show Padlock Banner */}
              {data.is_private ? (
                <div className="mx-6 mb-6 p-8 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Perfil Privado</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                      {data.message || 'Este perfil é privado. As estatísticas e biblioteca de jogos estão visíveis apenas para o proprietário.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* If Public: Show Library Counters & Recent Games */
                <div className="px-6 pb-6 space-y-6">
                  {/* Counters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-[#12141c] border border-[#232938] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-white">
                          {data.quantity_finished_games ?? 0}
                        </div>
                        <div className="text-xs text-slate-400">Jogos Zerados</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#12141c] border border-[#232938] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-white">
                          {data.quantity_backlog_games ?? 0}
                        </div>
                        <div className="text-xs text-slate-400">Fila do Backlog</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Beaten Games Preview */}
                  {data.recent_games && data.recent_games.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4 text-[#8670ff]" />
                        <span>Títulos Zerados Recentemente</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {data.recent_games.map((game: any) => (
                          <div
                            key={game.id_game}
                            className="rounded-xl overflow-hidden bg-[#12141c] border border-[#232938] group"
                          >
                            <div className="aspect-[3/4] w-full bg-[#181d29] relative overflow-hidden">
                              {game.url_image ? (
                                <img
                                  src={game.url_image}
                                  alt={game.name_game}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <Gamepad2 className="w-8 h-8" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-xs font-bold text-white truncate">
                                  {game.name_game}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {game.console?.name_console || 'Multi'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
