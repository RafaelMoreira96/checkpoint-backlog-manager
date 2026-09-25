import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { compressImage, CompressionResult } from '../../lib/imageCompression';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Check,
  Loader2,
  Zap,
  Link as LinkIcon,
  AlertCircle,
  FileText,
  Globe,
  Lock,
  Shield,
  User,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'bio' | 'privacy' | 'photos';
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'bio',
}) => {
  const { user, updateProfile } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'bio' | 'privacy' | 'photos'>('bio');

  // Form states
  const [bio, setBio] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [avatarCompression, setAvatarCompression] = useState<CompressionResult | null>(null);
  const [bannerCompression, setBannerCompression] = useState<CompressionResult | null>(null);

  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [isCompressingBanner, setIsCompressingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // File input refs
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  // Sync state when opening
  useEffect(() => {
    if (isOpen && user) {
      setBio(user.bio || '');
      setIsPublic(user.is_public !== false);
      setAvatarUrl(user.avatar_url || '');
      setBannerUrl(user.banner_url || '');
      setActiveTab(initialTab);
      setAvatarCompression(null);
      setBannerCompression(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, user, initialTab]);

  if (!isOpen) return null;

  // Handle Avatar file selection & compression
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP, etc).');
      return;
    }

    try {
      setIsCompressingAvatar(true);
      setErrorMsg(null);
      const result = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      setAvatarUrl(result.dataUrl);
      setAvatarCompression(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comprimir imagem do avatar.');
    } finally {
      setIsCompressingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = '';
    }
  };

  // Handle Banner file selection & compression
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP, etc).');
      return;
    }

    try {
      setIsCompressingBanner(true);
      setErrorMsg(null);
      const result = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 480,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      setBannerUrl(result.dataUrl);
      setBannerCompression(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comprimir imagem do banner.');
    } finally {
      setIsCompressingBanner(false);
      if (bannerFileRef.current) bannerFileRef.current.value = '';
    }
  };

  // Compress external URL if entered
  const handleCompressAvatarUrl = async (url: string) => {
    setAvatarUrl(url);
    if (!url.trim()) {
      setAvatarCompression(null);
      return;
    }
    if (url.startsWith('data:image/webp')) return;

    try {
      setIsCompressingAvatar(true);
      const result = await compressImage(url, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      setAvatarUrl(result.dataUrl);
      setAvatarCompression(result);
    } catch {
      // CORS fallback
    } finally {
      setIsCompressingAvatar(false);
    }
  };

  const handleCompressBannerUrl = async (url: string) => {
    setBannerUrl(url);
    if (!url.trim()) {
      setBannerCompression(null);
      return;
    }
    if (url.startsWith('data:image/webp')) return;

    try {
      setIsCompressingBanner(true);
      const result = await compressImage(url, {
        maxWidth: 1280,
        maxHeight: 480,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      setBannerUrl(result.dataUrl);
      setBannerCompression(result);
    } catch {
      // CORS fallback
    } finally {
      setIsCompressingBanner(false);
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    // Validate Bio Length
    if (bio.length > 300) {
      setErrorMsg('A biografia não pode exceder 300 caracteres.');
      setIsSaving(false);
      return;
    }

    try {
      let finalAvatar = avatarUrl.trim();
      let finalBanner = bannerUrl.trim();

      // Ensure compression if not already compressed and is a non-empty image
      if (finalAvatar && !avatarCompression && !finalAvatar.startsWith('data:image/webp')) {
        try {
          const comp = await compressImage(finalAvatar, { maxWidth: 400, maxHeight: 400 });
          finalAvatar = comp.dataUrl;
        } catch {
          // ignore CORS
        }
      }

      if (finalBanner && !bannerCompression && !finalBanner.startsWith('data:image/webp')) {
        try {
          const comp = await compressImage(finalBanner, { maxWidth: 1280, maxHeight: 480 });
          finalBanner = comp.dataUrl;
        } catch {
          // ignore CORS
        }
      }

      // Update profile in backend
      await updateProfile({
        avatar_url: finalAvatar || 'CLEAR',
        banner_url: finalBanner || 'CLEAR',
        bio: bio.trim(),
        is_public: isPublic,
      });

      setSuccessMsg('Perfil atualizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar alterações no perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const bioLength = bio.length;
  const remainingChars = 300 - bioLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#161922] border border-[#262d3d] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6c52ee]/20 flex items-center justify-center text-[#8670ff]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Configurações do Perfil
              </h3>
              <p className="text-[11px] text-slate-400">
                Personalize sua biografia, visibilidade e fotos no CheckPOINT
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#232938] bg-[#12151b]/80 px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'bio'
                ? 'border-[#6c52ee] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8670ff]" />
            <span>Biografia & Sobre</span>
            {bioLength > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-[#6c52ee] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-[#38bdf8]" />
            <span>Privacidade & Visibilidade</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isPublic
                  ? 'bg-[#10b981]/20 text-[#34d399]'
                  : 'bg-[#f59e0b]/20 text-[#fbbf24]'
              }`}
            >
              {isPublic ? 'Público' : 'Privado'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'photos'
                ? 'border-[#6c52ee] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4 text-[#ec4899]" />
            <span>Fotos & Mídia</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: BIOGRAFIA */}
          {activeTab === 'bio' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#8670ff]" />
                    <span>Biografia Gamer</span>
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conte para a comunidade seus consoles favoritos, gêneros preferidos ou o que está jogando.
                  </p>
                </div>
                <div
                  className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                    remainingChars < 20
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : remainingChars < 60
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#232938] text-slate-400'
                  }`}
                >
                  {bioLength} / 300
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={5}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Apaixonado por JRPGs da era PS1/PS2, fã incondicional de The Legend of Zelda e caçador de platinas no PlayStation. Atualmente explorando mundos abertos e indies aconchegantes."
                  className="w-full px-4 py-3 rounded-xl bg-[#12141c] border border-[#2b3345] focus:border-[#6c52ee] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6c52ee] transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-xl bg-[#12141c]/60 border border-[#232938] space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8670ff]" />
                  <span>Prévia no seu Perfil</span>
                </div>
                {bio.trim() ? (
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{bio.trim()}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Sua biografia ainda está vazia. Digite algo acima para se apresentar à comunidade.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDADE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#38bdf8]" />
                  <span>Visibilidade da Conta e Biblioteca</span>
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha quem pode visualizar seus jogos zerados, backlog e estatísticas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Opção Público */}
                <div
                  onClick={() => setIsPublic(true)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isPublic
                      ? 'bg-[#10b981]/10 border-[#10b981] shadow-lg shadow-[#10b981]/10 scale-[1.01]'
                      : 'bg-[#12141c] border-[#2b3345] hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                      <Globe className="w-5 h-5" />
                    </div>
                    {isPublic && (
                      <span className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Perfil Público</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#34d399]">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Qualquer jogador pode ver seu Gamer Hub, biblioteca de jogos zerados, horas jogadas e gráficos pelo seu link público.
                    </p>
                  </div>
                </div>

                {/* Opção Privado */}
                <div
                  onClick={() => setIsPublic(false)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !isPublic
                      ? 'bg-[#f59e0b]/10 border-[#f59e0b] shadow-lg shadow-[#f59e0b]/10 scale-[1.01]'
                      : 'bg-[#12141c] border-[#2b3345] hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                      <Lock className="w-5 h-5" />
                    </div>
                    {!isPublic && (
                      <span className="w-5 h-5 rounded-full bg-[#f59e0b] flex items-center justify-center text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Perfil Privado</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#fbbf24]">
                        Restrito
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Apenas você pode ver seus jogos zerados e estatísticas. Outros jogadores verão um aviso com cadeado gamer informando que o perfil é privado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-3.5 rounded-xl bg-[#1b202c] border border-[#2b3345] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300">
                  <span className="font-bold text-white">Segurança em Primeiro Lugar:</span> Seus dados sensíveis (e-mail, senha e tokens) nunca são expostos publicamente, independentemente da opção escolhida.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FOTOS & MÍDIA */}
          {activeTab === 'photos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. SEÇÃO DO BANNER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#8670ff]" />
                    <span>Foto de Banner (Capa)</span>
                  </label>
                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerUrl('');
                        setBannerCompression(null);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover Banner</span>
                    </button>
                  )}
                </div>

                {/* Banner Preview Area */}
                <div className="relative rounded-xl overflow-hidden h-36 sm:h-44 border border-[#2b3345] bg-[#12151b] group">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#1e153b] via-[#161922] to-[#0c1829] flex flex-col items-center justify-center text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-[#6c52ee]/20 flex items-center justify-center text-[#8670ff] mb-2">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Nenhum banner personalizado ativo</p>
                      <p className="text-[10px] text-slate-500">
                        Recomendado: 1200x400 px. A imagem será comprimida em WebP.
                      </p>
                    </div>
                  )}

                  {/* Overlay with Change Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerFileRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#6c52ee] hover:bg-[#5b40e2] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-black/50 transition-all hover:scale-105"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagem</span>
                    </button>
                  </div>

                  {isCompressingBanner && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8670ff]" />
                      <span>Comprimindo banner...</span>
                    </div>
                  )}
                </div>

                {/* Banner Inputs & Compression Stats */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={bannerFileRef}
                      onChange={handleBannerFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bannerFileRef.current?.click()}
                      className="px-3 py-2 rounded-lg bg-[#1f2432] hover:bg-[#282f42] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-colors shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#8670ff]" />
                      <span>Selecionar Arquivo</span>
                    </button>
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        placeholder="Ou cole a URL direta de uma imagem..."
                        value={bannerUrl.startsWith('data:') ? '' : bannerUrl}
                        onChange={(e) => handleCompressBannerUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#12141c] border border-[#2b3345] focus:border-[#6c52ee] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6c52ee] transition-all"
                      />
                    </div>
                  </div>

                  {/* Banner Compression Feedback */}
                  {bannerCompression && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold">Banner Comprimido:</span>
                      <span>
                        {bannerCompression.formattedOriginalSize} ➔ {bannerCompression.formattedCompressedSize}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-bold">
                        -{bannerCompression.reductionPercentage}%
                      </span>
                      <span className="text-emerald-400/70 hidden sm:inline">
                        • {bannerCompression.width}x{bannerCompression.height}px (WebP)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. SEÇÃO DO AVATAR */}
              <div className="space-y-3 pt-2 border-t border-[#232938]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#ec4899]" />
                    <span>Foto de Avatar (Perfil)</span>
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setAvatarCompression(null);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover Avatar</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Preview Circle */}
                  <div
                    onClick={() => avatarFileRef.current?.click()}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#6c52ee] via-[#ec4899] to-[#38bdf8] p-[3px] shadow-xl shadow-black/40 overflow-hidden cursor-pointer group shrink-0"
                  >
                    <div className="w-full h-full bg-[#12141c] rounded-[13px] overflow-hidden flex items-center justify-center font-display font-extrabold text-3xl text-white">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.nickname?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white text-[11px] font-semibold backdrop-blur-[2px]">
                      <Upload className="w-4 h-4 mb-0.5 text-white" />
                      <span>Subir Foto</span>
                    </div>

                    {isCompressingAvatar && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white text-[10px] gap-1">
                        <Loader2 className="w-5 h-5 animate-spin text-[#8670ff]" />
                        <span>Comprimindo...</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar Inputs */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={avatarFileRef}
                        onChange={handleAvatarFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-[#1f2432] hover:bg-[#282f42] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-colors shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#ec4899]" />
                        <span>Escolher Arquivo</span>
                      </button>
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="url"
                          placeholder="Ou cole a URL do seu avatar..."
                          value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                          onChange={(e) => handleCompressAvatarUrl(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#12141c] border border-[#2b3345] focus:border-[#6c52ee] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6c52ee] transition-all"
                        />
                      </div>
                    </div>

                    {avatarCompression && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold">Avatar Comprimido:</span>
                        <span>
                          {avatarCompression.formattedOriginalSize} ➔ {avatarCompression.formattedCompressedSize}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-bold">
                          -{avatarCompression.reductionPercentage}%
                        </span>
                        <span className="text-emerald-400/70 hidden sm:inline">
                          • {avatarCompression.width}x{avatarCompression.height}px (WebP)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer / Action Buttons */}
          <div className="pt-4 border-t border-[#232938] flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Visibilidade atual: </span>
              <span className={`font-bold ${isPublic ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>
                {isPublic ? 'Público' : 'Privado'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1f2432] hover:bg-[#282f42] text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || isCompressingAvatar || isCompressingBanner}
                className="px-5 py-2 rounded-lg bg-[#6c52ee] hover:bg-[#5b40e2] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#6c52ee]/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando Perfil...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
