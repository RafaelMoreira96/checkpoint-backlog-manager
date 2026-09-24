import React, { useState, useEffect } from 'react';
import { CreateGameDto, Game, useConsoles, useGenres, useIGDBSearch } from '@checkpoint/core';
import { api } from '../../lib/api';
import { X, Search, Sparkles, Image, Check, Loader2 } from 'lucide-react';

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
  const [nameGame, setNameGame] = useState(initialGame?.name_game || '');
  const [genreId, setGenreId] = useState<number>(initialGame?.genre_id || 1);
  const [consoleId, setConsoleId] = useState<number>(initialGame?.console_id || 1);
  const [developer, setDeveloper] = useState(initialGame?.developer || '');
  const [releaseYear, setReleaseYear] = useState<number | undefined>(initialGame?.release_year || new Date().getFullYear());
  const [timeBeating, setTimeBeating] = useState<number | undefined>(initialGame?.time_beating || 0);
  const [dateBeating, setDateBeating] = useState(initialGame?.date_beating || '');
  const [urlImage, setUrlImage] = useState(initialGame?.url_image || '');

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

  // Queries
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
      time_beating: isBacklog ? 0 : Number(timeBeating || 0),
      date_beating: isBacklog ? '' : dateBeating,
      url_image: urlImage.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-obsidian-800 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-obsidian-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-violet-neon" />
            {initialGame
              ? `Editar ${isBacklog ? 'Backlog' : 'Jogo Zerado'}`
              : `Novo ${isBacklog ? 'Título no Backlog' : 'Jogo Zerado'}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* IGDB Instant Search Autocomplete Bar */}
          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-neon" />
                Busca Rápida de Capa e Dados (IGDB)
              </label>
              {(isLoadingIGDB || isFetchingIGDB) && (
                <span className="text-[11px] text-violet-400 flex items-center gap-1">
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
                  placeholder="Digite o título (ex: Zelda, Elden Ring, Mario)..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-neon"
                />
                {igdbQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setIgdbQuery('');
                      setDebouncedQuery('');
                      setIsSearchingIGDB(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
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
                className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>

            {/* IGDB Dropdown Suggestions */}
            {isSearchingIGDB && debouncedQuery.length >= 2 && (
              <div className="mt-2.5 max-h-56 overflow-y-auto rounded-lg bg-obsidian-950 border border-white/10 divide-y divide-white/5 shadow-2xl">
                {isLoadingIGDB || isFetchingIGDB ? (
                  <div className="p-4 text-center text-xs text-violet-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    <span>Consultando catálogo na IGDB...</span>
                  </div>
                ) : igdbResults.length > 0 ? (
                  igdbResults.map((result: any) => {
                    const cover = result.cover_url || result.url_image;
                    return (
                      <div
                        key={result.id}
                        onClick={() => handleSelectIGDBGame(result)}
                        className="flex items-center gap-3 p-2.5 hover:bg-violet-900/30 cursor-pointer transition-colors group"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={result.name}
                            className="w-9 h-12 object-cover rounded border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-obsidian-850 rounded flex items-center justify-center text-slate-500 border border-white/10 shrink-0">
                            <Image className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                            {result.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {result.release_year && result.release_year > 0
                              ? `${result.release_year} • `
                              : ''}
                            {result.developer && result.developer !== 'Desconhecido'
                              ? result.developer
                              : 'Produtora não informada'}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 group-hover:bg-violet-500 group-hover:text-white transition-all">
                          Preencher
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum jogo encontrado no catálogo para &quot;{debouncedQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          <form id="game-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Game Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Nome do Jogo *
              </label>
              <input
                type="text"
                required
                value={nameGame}
                onChange={(e) => setNameGame(e.target.value)}
                placeholder="Ex: The Legend of Zelda: Tears of the Kingdom"
                className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
              />
            </div>

            {/* Platform & Genre Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Plataforma / Console *
                </label>
                <select
                  value={consoleId}
                  onChange={(e) => setConsoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                >
                  {consoles.map((c) => (
                    <option key={c.id_console} value={c.id_console}>
                      {c.name_console}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Gênero *
                </label>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                >
                  {genres.map((g) => (
                    <option key={g.id_genre} value={g.id_genre}>
                      {g.name_genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Developer & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Desenvolvedor
                </label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Ex: Nintendo EPD"
                  className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Ano de Lançamento
                </label>
                <input
                  type="number"
                  value={releaseYear || ''}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  placeholder="2023"
                  className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                />
              </div>
            </div>

            {/* Completion Time & Date (only if not backlog) */}
            {!isBacklog && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Tempo de Jogo (Horas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={timeBeating || ''}
                    onChange={(e) => setTimeBeating(Number(e.target.value))}
                    placeholder="Ex: 45.5"
                    className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Data do Zeramento
                  </label>
                  <input
                    type="date"
                    value={dateBeating}
                    onChange={(e) => setDateBeating(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
                  />
                </div>
              </div>
            )}

            {/* Poster Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                URL da Imagem da Capa
              </label>
              <input
                type="url"
                value={urlImage}
                onChange={(e) => setUrlImage(e.target.value)}
                placeholder="https://images.igdb.com/igdb/image/upload/t_cover_big/..."
                className="w-full px-3.5 py-2 rounded-lg bg-obsidian-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-neon"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-obsidian-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="game-form"
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-neon to-purple-600 text-white shadow-lg shadow-violet-glow hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
