import React, { useState, useRef } from 'react';
import { useImportGamesCSV } from '@checkpoint/core';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Info,
  ArrowRight,
} from 'lucide-react';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAuthenticated, openLogin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const importMutation = useImportGamesCSV(api);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setErrorMessage(null);
        setSuccessMessage(null);
      } else {
        setErrorMessage('Por favor, selecione apenas arquivos com extensão .csv');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setErrorMessage(null);
        setSuccessMessage(null);
      } else {
        setErrorMessage('Por favor, selecione apenas arquivos com extensão .csv');
      }
    }
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo CSV antes de enviar.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await importMutation.mutateAsync(selectedFile);
      setSuccessMessage(res.message || 'Jogos importados com sucesso em lotes!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Falha ao importar o arquivo CSV. Verifique a formatação das colunas.'
      );
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#161922] border border-[#232938] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#232938] bg-[#12141c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6c52ee]/15 border border-[#6c52ee]/30 flex items-center justify-center text-[#8b77f7]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Importar Jogos via CSV
              </h2>
              <p className="text-xs text-slate-400">
                Processamento ultrarrápido em lotes de streaming (O(BatchSize))
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#232938] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Success State */}
          {successMessage ? (
            <div className="p-6 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Importação Concluída!</h3>
                <p className="text-xs text-slate-300 mt-1">{successMessage}</p>
                <p className="text-xs text-[#10b981] mt-2 font-medium">
                  Sua biblioteca de jogos zerados e estatísticas foram atualizadas.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#232938] text-slate-300 hover:bg-[#2d3446] hover:text-white transition-all"
                >
                  Enviar Outro Arquivo
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#10b981] text-white hover:bg-[#059669] transition-all"
                >
                  Concluir e Ver Jogos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#6c52ee] bg-[#6c52ee]/10 scale-[1.01]'
                    : selectedFile
                    ? 'border-[#10b981]/50 bg-[#10b981]/5'
                    : 'border-[#2d3446] hover:border-[#6c52ee]/60 bg-[#12141c]/60 hover:bg-[#12141c]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-lg bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Arquivo CSV pronto para envio
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#232938] flex items-center justify-center text-slate-400 group-hover:text-white">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Clique para selecionar ou arraste seu arquivo CSV aqui
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Compatível com delimitador ponto-e-vírgula (;) ou vírgula (,)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ready-to-import badge for generated file */}
              <div className="p-3 rounded-lg bg-[#6c52ee]/10 border border-[#6c52ee]/20 flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-[#8b77f7] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Arquivo pronto para importação:</p>
                  <p className="text-slate-400">
                    Você pode selecionar o arquivo gerado{' '}
                    <code className="px-1.5 py-0.5 rounded bg-[#1e2230] text-[#a594fd] font-mono">
                      jogos_zerados_checkpoint_import.csv
                    </code>{' '}
                    localizado na raiz do projeto (com 611 jogos e capas HD do IGDB).
                  </p>
                </div>
              </div>

              {/* Layout Explanation */}
              <div className="p-3.5 rounded-lg bg-[#12141c] border border-[#232938] space-y-2 text-xs">
                <p className="font-semibold text-slate-300">Layout esperado de colunas:</p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">1. Nome</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">2. Gênero</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">3. Desenvolvedora</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">4. Console</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">5. Data Término</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">6. Horas</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938]">7. Ano</span>
                  <span className="px-2 py-0.5 rounded bg-[#1a1e2b] border border-[#232938] text-[#8b77f7]">8. Capa (Opcional)</span>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!successMessage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#232938] bg-[#12141c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#232938] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedFile || importMutation.isPending}
              onClick={handleUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#6c52ee] hover:bg-[#5b40e2] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#6c52ee]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando Lotes...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Importação</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
