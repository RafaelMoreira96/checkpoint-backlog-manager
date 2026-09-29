import React, { useState, useEffect } from 'react';
import { CreateGameDto, Game, useConsoles, useGenres, useIGDBSearch } from '@checkpoint/core';
import { api } from '../../lib/api';
import {
  X,
  Search,
  Sparkles,
  Image,
  Check,
  Loader2,
  Trophy,
  Bookmark,
  Calendar,
  Clock,
  Tv,
} from 'lucide-react';

interface GameFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGameDto) => Promise<void>;
  initialGame?: Game | null;
  isBacklog?: boolean;
}

export const GameFormModal: React.FC<GameFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialGame,
  isBacklog = false,
}) => {
  const [currentIsBacklog, setCurrentIsBacklog] = useState<boolean>(isBacklog);
  const [nameGame, setNameGame] = useState(initialGame?.name_game || '');
  const [genreId, setGenreId] = useState<number>(initialGame?.genre_id || 1);
  const [consoleId, setConsoleId] = useState<number>(initialGame?.console_id || 1);
  const [developer, setDeveloper] = useState(initialGame?.developer || '');
  const [releaseYear, setReleaseYear] = useState<number | undefined>(
    initialGame?.release_year || new Date().getFullYear()
  );
  const [timeBeating, setTimeBeating] = useState<number | undefined>(initialGame?.time_beating || 0);
  const [dateBeating, setDateBeating] = useState(
    initialGame?.date_beating || new Date().toISOString().split('T')[0]
  );
  const [urlImage, setUrlImage] = useState(initialGame?.url_image || '');

  // Keep state synced with props when modal opens
  useEffect(() => {
    setCurrentIsBacklog(isBacklog);
    if (initialGame) {
      setNameGame(initialGame.name_game);
      setGenreId(initialGame.genre_id || 1);
      setConsoleId(initialGame.console_id || 1);
      setDeveloper(initialGame.developer || '');
      setReleaseYear(initialGame.release_year || new Date().getFullYear());
      setTimeBeating(initialGame.time_beating || 0);
      setDateBeating(initialGame.date_beating || new Date().toISOString().split('T')[0]);
      setUrlImage(initialGame.url_image || '');
    }
  }, [isOpen, initialGame, isBacklog]);

  // IGDB Autocomplete State
  const [igdbQuery, setIgdbQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchingIGDB, setIsSearchingIGDB] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(igdbQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [igdbQuery]);

  // Catalog & Search Queries
  const { data: consoles = [] } = useConsoles(api);
  const { data: genres = [] } = useGenres(api);
  const {
    data: rawIgdbResults = [],
    isLoading: isLoadingIGDB,
    isFetching: isFetchingIGDB,
  } = useIGDBSearch(debouncedQuery, api);

  const igdbResults = Array.isArray(rawIgdbResults) ? rawIgdbResults : [];

  if (!isOpen) return null;

  const handleSelectIGDBGame = (igdbGame: any) => {
    setNameGame(igdbGame.name);
    const cover = igdbGame.cover_url || igdbGame.url_image || '';
    if (cover) {
      setUrlImage(cover);
    }
    if (igdbGame.developer && igdbGame.developer !== 'Desconhecido') {
      setDeveloper(igdbGame.developer);
    }
    if (igdbGame.release_year && igdbGame.release_year > 0) {
      setReleaseYear(igdbGame.release_year);
    }

    // Selecionar automaticamente o gênero correspondente do IGDB
    if (igdbGame.genre_id) {
      setGenreId(Number(igdbGame.genre_id));
    } else if (Array.isArray(igdbGame.genres) && igdbGame.genres.length > 0) {
      for (const igdbG of igdbGame.genres) {
        const targetId = typeof igdbG === 'object' ? igdbG.id : null;
        const targetSlug = typeof igdbG === 'object' ? igdbG.slug : '';
        const targetName = typeof igdbG === 'object' ? igdbG.name : String(igdbG);

        const matched = genres.find((g: any) => {
          if (targetId && g.igdb_genre_id && Number(g.igdb_genre_id) === Number(targetId)) return true;
          if (targetSlug && g.igdb_slug && g.igdb_slug.toLowerCase() === targetSlug.toLowerCase()) return true;
          const gName = (g.name_genre || '').toLowerCase();
          const tName = targetName.toLowerCase();
          return gName === tName || gName.includes(tName) || tName.includes(gName);
        });

        if (matched) {
          setGenreId(matched.id_genre);
          break;
        }
      }
    }

    setIsSearchingIGDB(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameGame.trim()) return;

    await onSubmit({
      name_game: nameGame.trim(),
      genre_id: Number(genreId),
      console_id: Number(consoleId),
      developer: developer.trim(),
      release_year: releaseYear ? Number(releaseYear) : undefined,
      time_beating: currentIsBacklog ? 0 : Number(timeBeating || 0),
      date_beating: currentIsBacklog ? '' : dateBeating,
      url_image: urlImage.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#161922] border border-[#262d3d] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header: Title & Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6c52ee]/20 flex items-center justify-center text-[#8670ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {initialGame ? 'Editar Jogo' : 'Registrar no Catálogo'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Adicione detalhes de gameplay, horas e capas oficiais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toggle Switch: Zerado vs Backlog (Iconic Backloggd Log Style) */}
        {!initialGame && (
          <div className="px-6 pt-4 pb-0 bg-[#161922]">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#12151b] border border-[#232938]">
              <button
                type="button"
                onClick={() => setCurrentIsBacklog(false)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  !currentIsBacklog
                    ? 'bg-[#10b981] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Jogo Zerado (Played)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentIsBacklog(true)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentIsBacklog
                    ? 'bg-[#f59e0b] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Na Fila do Backlog</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* IGDB Autocomplete Bar */}
          <div className="p-3.5 rounded-xl bg-[#1d222e] border border-[#2f384c]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[#8670ff] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8670ff]" />
                Buscar Dados & Capa Oficial (IGDB)
              </label>
              {(isLoadingIGDB || isFetchingIGDB) && (
                <span className="text-[11px] text-violet-300 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                </span>
              )}
            </div>

            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={igdbQuery}
                  onChange={(e) => {
                    setIgdbQuery(e.target.value);
                    setIsSearchingIGDB(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setDebouncedQuery(igdbQuery.trim());
                      setIsSearchingIGDB(true);
                    }
                  }}
                  placeholder="Ex: Elden Ring, Bloodborne, Mario Odyssey..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#12151b] border border-[#282f42] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6c52ee]"
                />
                {igdbQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setIgdbQuery('');
                      setDebouncedQuery('');
                      setIsSearchingIGDB(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDebouncedQuery(igdbQuery.trim());
                  setIsSearchingIGDB(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#6c52ee] hover:bg-[#5b40e2] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>

            {/* IGDB Dropdown Suggestions */}
            {isSearchingIGDB && debouncedQuery.length >= 2 && (
              <div className="mt-2.5 max-h-56 overflow-y-auto rounded-lg bg-[#12151b] border border-[#282f42] divide-y divide-[#202636] shadow-2xl">
                {isLoadingIGDB || isFetchingIGDB ? (
                  <div className="p-4 text-center text-xs text-violet-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8670ff]" />
                    <span>Consultando catálogo na IGDB...</span>
                  </div>
                ) : igdbResults.length > 0 ? (
                  igdbResults.map((result: any) => {
                    const cover = result.cover_url || result.url_image;
                    return (
                      <div
                        key={result.id}
                        onClick={() => handleSelectIGDBGame(result)}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#202636] cursor-pointer transition-colors group"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={result.name}
                            className="w-9 h-12 object-cover rounded border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-[#181c24] rounded flex items-center justify-center text-slate-500 border border-white/10 shrink-0">
                            <Image className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-[#8670ff] transition-colors truncate">
                            {result.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            {result.release_year && result.release_year > 0
                              ? `${result.release_year} • `
                              : ''}
                            <span className="truncate">
                              {result.developer && result.developer !== 'Desconhecido'
                                ? result.developer
                                : 'Produtora não informada'}
                            </span>
                            {result.genre_name && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30 shrink-0">
                                {result.genre_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-[#6c52ee]/20 text-[#a594fd] border border-[#6c52ee]/30 group-hover:bg-[#6c52ee] group-hover:text-white transition-all font-semibold">
                          Usar
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum título encontrado para &quot;{debouncedQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          <form id="game-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Game Name & Cover Preview */}
            <div className="flex items-start gap-4">
              {/* Cover Preview Pill */}
              <div className="w-16 h-22 aspect-[2/3] rounded-lg bg-[#12151b] border border-[#262d3d] overflow-hidden shrink-0 flex items-center justify-center text-slate-500 shadow">
                {urlImage ? (
                  <img src={urlImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Tv className="w-6 h-6 text-slate-600" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nome do Jogo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameGame}
                    onChange={(e) => setNameGame(e.target.value)}
                    placeholder="Ex: Baldur's Gate 3"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    URL da Imagem da Capa
                  </label>
                  <input
                    type="url"
                    value={urlImage}
                    onChange={(e) => setUrlImage(e.target.value)}
                    placeholder="https://images.igdb.com/..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#12151b] border border-[#262d3d] text-xs text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Platform & Genre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Plataforma / Console *
                </label>
                <select
                  value={consoleId}
                  onChange={(e) => setConsoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] cursor-pointer"
                >
                  {consoles.map((c) => (
                    <option key={c.id_console} value={c.id_console}>
                      {c.name_console}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Gênero *
                </label>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] cursor-pointer"
                >
                  {genres.map((g) => (
                    <option key={g.id_genre} value={g.id_genre}>
                      {g.name_genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Developer & Release Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Desenvolvedor
                </label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Ex: FromSoftware, Capcom..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ano de Lançamento
                </label>
                <input
                  type="number"
                  value={releaseYear || ''}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  placeholder="2024"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee]"
                />
              </div>
            </div>

            {/* Completion details if not backlog */}
            {!currentIsBacklog && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#232938]">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                    Tempo Jogado (Horas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={timeBeating || ''}
                    onChange={(e) => setTimeBeating(Number(e.target.value))}
                    placeholder="Ex: 35.5"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#10b981]" />
                    Data de Conclusão
                  </label>
                  <input
                    type="date"
                    value={dateBeating}
                    onChange={(e) => setDateBeating(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee]"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#232938] bg-[#12151b]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="game-form"
            className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white shadow-lg shadow-[#6c52ee]/30 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Salvar no Catálogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
