import React from 'react';
import { Icons } from './Icons';

const PRICE_PRO = "49,90";

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-light to-primary-DEFAULT"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <Icons.Plus size={24} className="rotate-45" />
        </button>
        
        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-primary-DEFAULT/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-DEFAULT">
            <span className="text-3xl">💎</span>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Seja Premium</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg font-light">
            Desbloqueie todo o potencial do seu negócio.
          </p>
          
          <div className="space-y-3 mb-8 text-left">
             <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Icons.Check className="text-obra-green" /> <span>Salvar orçamentos ilimitados</span>
             </div>
             <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Icons.Check className="text-obra-green" /> <span>Gerar PDFs profissionais</span>
             </div>
             <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Icons.Check className="text-obra-green" /> <span>Gestão completa de clientes</span>
             </div>
          </div>

          <div className="bg-gradient-to-r from-background-light to-white dark:from-surface-dark dark:to-surface-hoverDark p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-6 shadow-sm">
             <span className="text-sm font-bold text-gray-500 uppercase">Pagamento Único</span>
             <span className="text-2xl font-extrabold text-primary-DEFAULT">R$ {PRICE_PRO}</span>
          </div>
          
          <button 
            onClick={onUpgrade}
            className="w-full bg-primary-DEFAULT hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-DEFAULT/30 transition-all transform hover:scale-[1.02]"
          >
            QUERO SER PREMIUM
          </button>
        </div>
      </div>
    </div>
  );
};