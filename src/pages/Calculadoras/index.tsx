import React, { useState } from 'react';
import { Icons } from '../../components/Icons';
import { DrywallPage } from './Drywall/index';

export const Calculadoras = () => {
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null);

  if (selectedCalc === 'drywall') {
    return (
      <div>
        <button 
          onClick={() => setSelectedCalc(null)} 
          className="mb-4 text-sm font-semibold text-slate-600 hover:text-primary-DEFAULT flex items-center gap-2"
        >
          <Icons.ArrowLeft size={16} /> Voltar para Calculadoras
        </button>
        <DrywallPage />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
         <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Calculadoras Especializadas</h1>
         <p className="text-slate-600 dark:text-gray-400 font-medium">Escolha a ferramenta ideal para o seu serviço de hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Drywall Card */}
        <div 
          onClick={() => setSelectedCalc('drywall')}
          className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft border border-blue-200 dark:border-gray-800 hover:shadow-lg hover:border-primary-DEFAULT transition-all cursor-pointer group"
        >
           <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-primary-DEFAULT rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icons.Edit size={28} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Drywall & Gesso</h3>
           <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 font-medium">
             Cálculo completo de paredes, forros, guias, montantes e parafusos.
           </p>
           <div className="flex items-center gap-2 text-primary-DEFAULT font-bold text-sm">
             Acessar Calculadora <Icons.ArrowLeft className="rotate-180" size={16} />
           </div>
        </div>

        {/* Painting Placeholder */}
        <div className="bg-gray-50 dark:bg-surface-dark/50 p-6 rounded-2xl border border-blue-100 dark:border-gray-800 opacity-60 cursor-not-allowed">
           <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-xl flex items-center justify-center mb-4">
              <Icons.Edit size={28} />
           </div>
           <h3 className="text-xl font-bold text-gray-500 mb-2">Pintura (Em breve)</h3>
           <p className="text-gray-500 text-sm mb-4">
             Cálculo de tinta, massa corrida e selador por m².
           </p>
        </div>

        {/* Electrical Placeholder */}
        <div className="bg-gray-50 dark:bg-surface-dark/50 p-6 rounded-2xl border border-blue-100 dark:border-gray-800 opacity-60 cursor-not-allowed">
           <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-xl flex items-center justify-center mb-4">
              <Icons.Sun size={28} />
           </div>
           <h3 className="text-xl font-bold text-gray-500 mb-2">Elétrica (Em breve)</h3>
           <p className="text-gray-500 text-sm mb-4">
             Pontos de tomada, iluminação e fiação estimada.
           </p>
        </div>
      </div>
    </div>
  );
};