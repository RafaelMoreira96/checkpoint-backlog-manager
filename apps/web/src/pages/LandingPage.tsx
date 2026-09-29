import React from 'react';
import {
  Gamepad2,
  Trophy,
  Bookmark,
  BarChart3,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  LogIn,
  UserPlus,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  // Sample popular games for the hero showcase
  const sampleShowcase = [
    {
      title: 'Elden Ring',
      year: 2022,
      platform: 'PC / PS5',
      time: '85h',
      rating: '5.0',
      status: 'zerado',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    },
    {
      title: 'Zelda: Tears of the Kingdom',
      year: 2023,
      platform: 'Nintendo Switch',
      time: '64h',
      rating: '4.9',
      status: 'zerado',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
    },
    {
      title: 'Baldur\'s Gate 3',
      year: 2023,
      platform: 'PC / PS5',
      time: 'Fila',
      rating: '5.0',
      status: 'backlog',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    },
    {
      title: 'Cyberpunk 2077: Phantom Liberty',
      year: 2023,
      platform: 'PC / PS5 / Xbox',
      time: '42h',
      rating: '4.7',
      status: 'zerado',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6sp7.webp',
    },
    {
      title: 'Hollow Knight: Silksong',
      year: 2024,
      platform: 'Multiplataforma',
      time: 'Fila',
      rating: '4.9',
      status: 'backlog',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp',
    },
  ];

  return (
    <div className="min-h-screen bg-[#12151b] text-slate-100 flex flex-col font-sans selection:bg-[#6c52ee] selection:text-white">
      {/* 1. Header / Navbar for Visitors */}
      <header className="sticky top-0 z-40 bg-[#12151b]/90 backdrop-blur-md border-b border-[#222836]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#6c52ee] to-[#4834b8] p-[1.5px] shadow-lg shadow-[#6c52ee]/25">
              <div className="w-full h-full bg-[#12151b] rounded-[7px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#8670ff]" />
              </div>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              Check<span className="text-[#7d66f6]">POINT</span>
            </span>
          </div>

          {/* Navigation Links (Anchors) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <a href="#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#vitrine" className="hover:text-white transition-colors">
              Como Funciona
            </a>
            <a href="#estatisticas" className="hover:text-white transition-colors">
              Estatísticas
            </a>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-md shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Criar Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#232938]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6c52ee]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181c25] border border-[#2c3447] text-xs font-bold text-[#a594fd] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#8670ff]" />
            <span>O Letterboxd dos Games &bull; Experiência Backloggd</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Acompanhe cada jogo zerado.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8670ff] via-[#a855f7] to-[#38bdf8]">
              Domine seu backlog.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Seu diário gamer definitivo. Registre suas horas de gameplay, avalie com estrelas,
            organize sua fila de espera e descubra estatísticas detalhadas com o catálogo oficial IGDB.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-display font-extrabold text-sm uppercase tracking-wider bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-xl shadow-[#6c52ee]/35 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#181c25] hover:bg-[#202534] text-slate-200 border border-[#2d364a] transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Já possuo uma conta</span>
            </button>
          </div>

          {/* Micro badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" /> 100% Gratuito
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#fbbf24]" /> Busca rápida IGDB
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#8670ff]" /> Vitrine de favoritos
            </span>
          </div>

          {/* 3. Hero Visual Fan (Showcase of Posters) */}
          <div className="mt-14 pt-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {sampleShowcase.map((game, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col text-left transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#181c24] border border-[#282f42] shadow-lg group-hover:border-[#6c52ee] group-hover:shadow-2xl group-hover:shadow-[#6c52ee]/25">
                    {/* Ribbon */}
                    <div className="absolute top-2 left-2 z-10">
                      {game.status === 'zerado' ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#10b981]/90 text-black backdrop-blur-md">
                          <Trophy className="w-2.5 h-2.5" /> Zerado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#f59e0b]/90 text-black backdrop-blur-md">
                          <Bookmark className="w-2.5 h-2.5" /> Backlog
                        </span>
                      )}
                    </div>

                    {/* Time Pill */}
                    {game.status === 'zerado' && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#12151b]/90 text-[#38bdf8] border border-white/10">
                          <Clock className="w-2.5 h-2.5" /> {game.time}
                        </span>
                      </div>
                    )}

                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101319] via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-end">
                      <div className="flex items-center gap-1 text-[#fbbf24] text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-[#fbbf24]" />
                        <span>{game.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 px-0.5">
                    <h4 className="font-semibold text-xs text-white truncate">{game.title}</h4>
                    <span className="text-[10px] text-slate-400">{game.platform}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Counter Bar */}
      <section className="bg-[#161922] border-b border-[#232938] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#232938]">
            <div className="pt-2 md:pt-0">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                +500.000
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">
                Jogos no Catálogo IGDB
              </div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#10b981]">
                100% Personalizado
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">
                Seu Diário Gamer Único
              </div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#f59e0b]">
                Proporção 2:3
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">
                Capas Verticais Oficiais
              </div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#38bdf8]">
                Gráficos & Métricas
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">
                Gêneros, Consoles e Anos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section id="recursos" className="py-16 md:py-24 border-b border-[#232938]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8670ff]">
              Tudo o que você precisa
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-1.5 tracking-tight">
              A melhor experiência para gerenciar sua carreira gamer
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Projetado com base no Backloggd e Letterboxd para ser rápido, bonito e completo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#161922] border border-[#232938] hover:border-[#10b981]/40 hover:-translate-y-1 transition-all shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  Diário de Zeramento
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Registre a data em que finalizou cada jogo, a quantidade de horas dedicadas e a plataforma em que jogou.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#10b981] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Histórico completo
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#161922] border border-[#232938] hover:border-[#f59e0b]/40 hover:-translate-y-1 transition-all shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] mb-4">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  Fila do Backlog
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Adicione jogos comprados ou desejados para sua lista de espera. Ao terminar, clique em &quot;Zerei!&quot; e transfira com um clique.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#f59e0b] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Botão rápido Zerei!
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#161922] border border-[#232938] hover:border-[#6c52ee]/40 hover:-translate-y-1 transition-all shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#6c52ee]/15 border border-[#6c52ee]/30 flex items-center justify-center text-[#8670ff] mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  Vitrine Top 4 Favoritos
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Destaque no topo do seu perfil seus 4 jogos mais marcantes de todos os tempos, exatamente como no Backloggd e Letterboxd.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#8670ff] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Visual de destaque
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#161922] border border-[#232938] hover:border-[#0ea5e9]/40 hover:-translate-y-1 transition-all shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/30 flex items-center justify-center text-[#38bdf8] mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  Estatísticas Gamísticas
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Métricas avançadas por gênero, plataforma e ano de lançamento para entender exatamente o seu perfil de jogador.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#38bdf8] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Análise profunda
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Profile Demo Showcase */}
      <section id="vitrine" className="py-16 md:py-24 bg-[#0e1117] border-b border-[#232938]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#161922] border border-[#262d3d] p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232938]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#10b981]">
                  Experiência Autêntica
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                  Seu Perfil Gamer personalizado
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Veja como fica o seu hub quando você estiver logado no CheckPOINT
                </p>
              </div>
              <button
                onClick={onOpenRegister}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-md shadow-[#6c52ee]/25 self-start sm:self-auto transition-all"
              >
                Criar Meu Perfil
              </button>
            </div>

            {/* Mock Profile Card */}
            <div className="rounded-xl bg-[#12151b] border border-[#232938] overflow-hidden">
              <div className="h-24 sm:h-32 bg-gradient-to-r from-[#1e153b] via-[#161922] to-[#0c1829] relative p-4 flex items-end">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-tr from-[#6c52ee] to-[#38bdf8] p-[2px] shadow-lg">
                    <div className="w-full h-full bg-[#12151b] rounded-[10px] flex items-center justify-center font-display font-extrabold text-xl text-white">
                      R
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-base sm:text-lg text-white">
                      @rafael
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30 font-bold">
                      Gamer Hub
                    </span>
                  </div>
                </div>
              </div>

              {/* Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#232938] bg-[#161922] text-center p-3 border-t border-[#232938]">
                <div className="p-2">
                  <div className="text-lg font-extrabold text-white">42</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Zerados</div>
                </div>
                <div className="p-2">
                  <div className="text-lg font-extrabold text-[#f59e0b]">15</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">No Backlog</div>
                </div>
                <div className="p-2">
                  <div className="text-lg font-extrabold text-[#38bdf8]">420h</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Horas Totais</div>
                </div>
                <div className="p-2">
                  <div className="text-lg font-extrabold text-[#10b981]">RPG</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Top Gênero</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-16 md:py-24 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#6c52ee]/20 border border-[#6c52ee]/30 text-[#8670ff] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Pronto para transformar sua experiência com games?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Crie sua conta em menos de 1 minuto, adicione seus primeiros jogos e monte sua vitrine dos sonhos.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-extrabold text-sm uppercase tracking-wider bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-xl shadow-[#6c52ee]/40 transition-all hover:scale-[1.03]"
            >
              Criar Conta Gratuita
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-[#181c25] hover:bg-[#202534] text-slate-200 border border-[#2d364a] transition-all"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-[#232938] bg-[#0d1015] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6c52ee]/20 flex items-center justify-center text-[#8670ff]">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white">Check<span className="text-[#8670ff]">POINT</span></span>
            <span>&bull; Inspirado no visual e na experiência do Backloggd</span>
          </div>
          <p className="text-[11px] text-slate-600">
            CheckPOINT Platform &bull; React Web, GoFiber, PostgreSQL & IGDB &bull; 2026
          </p>
        </div>
      </footer>
    </div>
  );
};
