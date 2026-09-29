import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Lock,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface ClearAllGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  gamesCount: number;
  nickname: string;
}

export const ClearAllGamesModal: React.FC<ClearAllGamesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  gamesCount,
  nickname,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const expectedPhrase = `${nickname || 'usuario'}/zerados`;
  const isMatch = confirmationInput.trim() === expectedPhrase;
  const canSubmit = isMatch && acknowledged && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ocorreu um erro ao excluir os jogos. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setConfirmationInput('');
    setAcknowledged(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#161922] border border-rose-500/30 shadow-2xl shadow-rose-950/40 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Danger Zone Style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232938] bg-[#12151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Zona de Perigo</h3>
              <p className="text-[11px] text-slate-400">Limpar todos os jogos zerados</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Atenção: Esta ação é permanente e irreversível!</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todos os seus <strong className="text-white">{gamesCount} jogos zerados</strong>,
              datas de conclusão, horas jogadas e avaliações serão apagados definitivamente da sua conta.
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-rose-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Seus jogos na <strong>Fila do Backlog</strong> não serão afetados.</span>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Confirmation Step 1: GitHub-like exact phrase typing */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Para confirmar, digite exatamente{' '}
              <span className="px-2 py-0.5 rounded bg-black/40 text-rose-400 font-mono font-bold select-all border border-rose-500/30">
                {expectedPhrase}
              </span>{' '}
              no campo abaixo:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={expectedPhrase}
              autoFocus
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#12151b] border text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-mono ${
                confirmationInput.length === 0
                  ? 'border-[#262d3d] focus:border-rose-500'
                  : isMatch
                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                  : 'border-rose-500/80 ring-1 ring-rose-500/30'
              }`}
            />
            {confirmationInput.length > 0 && !isMatch && (
              <p className="text-[11px] text-rose-400 font-medium">
                O texto digitado não confere com a frase esperada.
              </p>
            )}
          </div>

          {/* Confirmation Step 2: Checkbox acknowledgement */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#12151b] border border-[#262d3d] cursor-pointer hover:border-slate-600 transition-colors select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              Estou ciente de que todos os meus registros de jogos zerados serão apagados permanentemente e que esta ação não pode ser desfeita.
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#232938] hover:bg-[#2d3446] text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                canSubmit
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-[#232938]/60 text-slate-500 border border-[#2b3345] cursor-not-allowed opacity-60'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Excluindo Biblioteca...</span>
                </>
              ) : !canSubmit ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirmação Necessária</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Excluir Todos os Jogos Zerados</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
