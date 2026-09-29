import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, Gamepad2, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openLogin,
    openRegister,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  // Form states
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [namePlayer, setNamePlayer] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        if (!nickname.trim() || !password) {
          setErrorMessage('Preencha seu nickname e senha.');
          setIsLoading(false);
          return;
        }
        await login({ nickname: nickname.trim(), password });
      } else {
        if (!namePlayer.trim() || !email.trim() || !nickname.trim() || !password) {
          setErrorMessage('Preencha todos os campos obrigatórios.');
          setIsLoading(false);
          return;
        }
        await register({
          name_player: namePlayer.trim(),
          email: email.trim(),
          nickname: nickname.trim(),
          password,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na autenticação. Verifique os dados digitados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#161922] border border-[#262d3d] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6c52ee]/20 flex items-center justify-center text-[#8670ff] shadow-sm">
              <Gamepad2 className="w-4 h-4 text-[#8670ff]" />
            </div>
            <span className="font-display font-bold text-white text-base">
              Check<span className="text-[#8670ff]">POINT</span>
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#232938] bg-[#12151b]">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              openLogin();
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              authModalMode === 'login'
                ? 'border-[#6c52ee] text-white bg-[#6c52ee]/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              openRegister();
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              authModalMode === 'register'
                ? 'border-[#10b981] text-white bg-[#10b981]/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Conta</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={namePlayer}
                  onChange={(e) => setNamePlayer(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gamer.com"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nickname *
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ex: player_one"
              className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Senha *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-lg bg-[#12151b] border border-[#262d3d] text-sm text-white focus:outline-none focus:border-[#6c52ee] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 mt-2 rounded-lg text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              authModalMode === 'login'
                ? 'bg-[#6c52ee] hover:bg-[#5b40e2] shadow-[#6c52ee]/30'
                : 'bg-[#10b981] hover:bg-[#059669] shadow-[#10b981]/30'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : authModalMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no CheckPOINT</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar e Começar</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-[#232938] bg-[#12151b] text-center text-xs text-slate-500">
          {authModalMode === 'login' ? (
            <p>
              Não tem uma conta gamer?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openRegister();
                }}
                className="text-[#8670ff] hover:underline font-semibold"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openLogin();
                }}
                className="text-[#10b981] hover:underline font-semibold"
              >
                Faça login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
