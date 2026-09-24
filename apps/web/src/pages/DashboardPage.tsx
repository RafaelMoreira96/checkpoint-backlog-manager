import React from 'react';
import {
  useDashboardStats,
  useLastGamesBeaten,
  useLastBacklog,
  Game,
} from '@checkpoint/core';
import { api } from '../lib/api';
import {
  Trophy,
  CalendarCheck,
  Clock,
  Crown,
  Compass,
  Hourglass,
  ArrowRight,
  Tv,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'games' | 'backlog') => void;
  onEditGame: (game: Game) => void;
  onCompleteBacklog: (game: Game) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onEditGame,
  onCompleteBacklog,
}) => {
  const { data: stats } = useDashboardStats(api);
  const { data: rawLastBeaten } = useLastGamesBeaten(api);
  const { data: rawLastBacklog } = useLastBacklog(api);

  const lastBeaten = Array.isArray(rawLastBeaten) ? rawLastBeaten : [];
  const lastBacklog = Array.isArray(rawLastBacklog) ? rawLastBacklog : [];

  const metricCards = [
    {
      title: 'Total Zerados',
      value: stats?.total_games_finished ? `${stats.total_games_finished} jogos` : '0 jogos',
      subtitle: 'Conquistas registradas',
      icon: Trophy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Zerados este Mês',
      value: stats?.games_finished_this_month ? `${stats.games_finished_this_month} jogos` : '0 jogos',
      subtitle: 'Ritmo mensal',
      icon: CalendarCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Horas no Mês',
      value: stats?.total_hours_played_this_month ? `${Number(stats.total_hours_played_this_month).toFixed(1)}h` : '0h',
      subtitle: 'Tempo dedicado no mês',
      icon: Clock,
      color: 'text-violet-neon',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Tempo Total',
      value: stats?.total_hours_played ? `${Number(stats.total_hours_played).toFixed(1)}h` : '0h',
      subtitle: 'Horas totais de jogo',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Gênero Favorito',
      value: stats?.most_used || 'N/A',
      subtitle: 'Mais jogado na carreira',
      icon: Crown,
      color: 'text-violet-neon',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: '2º Favorito',
      value: stats?.second_most_used || 'N/A',
      subtitle: 'Gênero em destaque',
      icon: Compass,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-1">
          Painel do Jogador
        </h1>
        <p className="text-sm text-slate-400">
          Acompanhe suas estatísticas, últimos jogos zerados e status da sua fila no CheckPOINT
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-obsidian-800 border border-white/10 hover:border-violet-neon/40 hover:-translate-y-1 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xl font-display font-extrabold text-white mb-0.5">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Timeline + Backlog Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline (Left) */}
        <div className="lg:col-span-7 rounded-2xl bg-obsidian-800 border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              Timeline de Conclusões Recentes
            </h2>
            <button
              onClick={() => onNavigateTab('games')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lastBeaten.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum jogo zerado registrado recentemente.
            </div>
          ) : (
            <div className="space-y-4">
              {lastBeaten.map((game) => (
                <div
                  key={game.id_game}
                  onClick={() => onEditGame(game)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-obsidian-900/60 border border-white/5 hover:border-emerald-500/30 hover:bg-obsidian-900 transition-all cursor-pointer"
                >
                  {game.url_image ? (
                    <img
                      src={game.url_image}
                      alt={game.name_game}
                      className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-lg bg-obsidian-950 flex items-center justify-center border border-white/10 text-slate-500 shrink-0">
                      <Tv className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate mb-1">
                      {game.name_game}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {game.genre?.name_genre && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {game.genre.name_genre}
                        </span>
                      )}
                      {game.console?.name_console && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400">
                          {game.console.name_console}
                        </span>
                      )}
                      {game.date_beating && game.date_beating !== '01/01/0001' && (
                        <span className="ml-auto text-[11px] text-slate-500">
                          {game.date_beating}
                        </span>
                      )}
                    </div>
                  </div>

                  {game.time_beating !== undefined && (
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-emerald-400">
                        {game.time_beating}h
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backlog Spotlight (Right) */}
        <div className="lg:col-span-5 rounded-2xl bg-obsidian-800 border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-amber-400" />
              Fila do Backlog
            </h2>
            <button
              onClick={() => onNavigateTab('backlog')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              Ver fila completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lastBacklog.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum título na fila de espera.
            </div>
          ) : (
            <div className="space-y-3">
              {lastBacklog.map((game) => (
                <div
                  key={game.id_game}
                  className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-900/60 border border-white/5 hover:border-amber-500/30 hover:bg-obsidian-900 transition-all"
                >
                  {game.url_image ? (
                    <img
                      src={game.url_image}
                      alt={game.name_game}
                      className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-obsidian-950 flex items-center justify-center border border-white/10 text-slate-500 shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate mb-1">
                      {game.name_game}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {game.console?.name_console && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 text-[10px]">
                          {game.console.name_console}
                        </span>
                      )}
                      {game.genre?.name_genre && (
                        <span className="text-[10px] text-slate-500 truncate">
                          {game.genre.name_genre}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onCompleteBacklog(game)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                    title="Marcar como Zerado!"
                  >
                    Zerei!
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
