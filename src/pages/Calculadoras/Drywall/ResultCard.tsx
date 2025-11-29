import React from 'react';
import { DrywallResults } from './types';
import { Icons } from '../../../components/Icons';

interface ResultCardProps {
  results: DrywallResults;
}

const ResultRow = ({ label, value, unit, icon }: { label: string; value: string | number; unit?: string; icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0 group hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
    <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
      {icon && <span className="text-primary-DEFAULT">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-right">
      <span className="text-lg font-bold text-white tracking-wide">{value}</span>
      {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
    </div>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ results }) => {
  return (
    <div className="bg-[#1E293B] dark:bg-[#0F172A] rounded-2xl p-6 shadow-2xl border border-slate-700 dark:border-slate-800 sticky top-24 text-white overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-DEFAULT blur-[60px] opacity-20 pointer-events-none"></div>

      <div className="mb-6 flex items-center justify-between relative z-10">
        <h3 className="text-xl font-bold text-white tracking-tight">Resumo da Obra</h3>
        <div className="p-2 bg-primary-DEFAULT/20 rounded-lg text-primary-DEFAULT border border-primary-DEFAULT/20">
          <Icons.List size={20} />
        </div>
      </div>

      <div className="space-y-1 mb-8 relative z-10">
        <div className="flex justify-between items-end mb-2">
            <span className="text-slate-400 text-sm font-medium">Área Total Útil</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">{results.areaUtil.toFixed(2)} <span className="text-lg font-semibold text-slate-500">m²</span></span>
        </div>
        <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-DEFAULT to-primary-light w-full shadow-[0_0_10px_rgba(37,100,207,0.5)]"></div>
        </div>
      </div>

      <div className="space-y-0 relative z-10">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4">Estrutura & Placas</h4>
        <ResultRow label="Placas ST (1.80x1.20)" value={results.platesCount} unit="un" />
        <ResultRow label="Montantes (3m)" value={results.studsCount} unit="un" />
        <ResultRow label="Guias (3m)" value={results.guidesPieces} unit="barras" />
        
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">Fixação & Acabamento</h4>
        <ResultRow label="Parafusos GN25" value={results.screwsPlate} unit="un" />
        <ResultRow label="Parafusos Metal" value={results.screwsStructure} unit="un" />
        <ResultRow label="Fita de Papel" value={results.tape.toFixed(1)} unit="m²" />
        <ResultRow label="Massa Drywall" value={results.compound.toFixed(1)} unit="kg" />
        
        {results.woolRolls > 0 && (
          <>
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">Isolamento</h4>
             <ResultRow label="Lã de Vidro" value={results.woolRolls} unit="rolos" />
          </>
        )}

        <div className="mt-8 p-5 bg-gradient-to-br from-primary-DEFAULT/10 to-transparent rounded-xl border border-primary-DEFAULT/20">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-primary-light font-medium">Estimativa Mão de Obra</span>
            </div>
            <div className="text-3xl font-bold text-white">
                R$ {results.laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
        </div>
      </div>
    </div>
  );
};