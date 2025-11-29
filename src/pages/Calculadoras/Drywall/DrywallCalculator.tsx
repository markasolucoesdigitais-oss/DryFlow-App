import React, { useState, useEffect } from 'react';
import { DrywallInputs, DrywallResults } from './types';
import { calculateDrywall } from './drywallLogic';
import { InputGroup } from './InputGroup';
import { ResultCard } from './ResultCard';
import { Icons } from '../../../components/Icons';
import { usePremiumGate } from '../../../hooks/usePremiumGate';

const DrywallCalculator: React.FC = () => {
  const { checkAccess } = usePremiumGate();
  
  const [inputs, setInputs] = useState<DrywallInputs>({
    width: 0,
    height: 2.60,
    deduction: 0,
    spacing: 0.60,
    laborPrice: 40.00,
    hasWool: false
  });

  const [results, setResults] = useState<DrywallResults>({
      areaTotal: 0, areaUtil: 0, platesCount: 0, guidesLinear: 0, guidesPieces: 0, 
      studsCount: 0, screwsPlate: 0, screwsStructure: 0, tape: 0, compound: 0, 
      woolRolls: 0, laborCost: 0
  });

  useEffect(() => {
    setResults(calculateDrywall(inputs));
  }, [inputs]);

  const handleUpdate = (field: keyof DrywallInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePremiumAction = (action: string) => {
    const allowed = checkAccess(action);
    if (allowed) {
      alert(`${action} realizado com sucesso! (Simulação)`);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2.5 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-surface-hoverDark rounded-xl transition-all shadow-sm">
            <Icons.ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Calculadora Drywall <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-primary-DEFAULT to-primary-light text-white rounded-full font-bold tracking-wide shadow-glow">PRO</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Paredes e divisórias com precisão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Dimensions */}
          <section className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-2xl shadow-soft dark:shadow-none border border-border-highlight dark:border-border-dark">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-primary-DEFAULT/20 text-primary-DEFAULT dark:text-blue-300 rounded-xl flex items-center justify-center border border-blue-100 dark:border-primary-DEFAULT/10">
                    <Icons.Edit size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Dimensões</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Comprimento (m)" 
                  value={inputs.width} 
                  onChange={v => handleUpdate('width', v)} 
                  placeholder="Ex: 5.00"
                />
                <InputGroup 
                  label="Pé Direito (m)" 
                  value={inputs.height} 
                  onChange={v => handleUpdate('height', v)} 
                  placeholder="Ex: 2.60"
                />
             </div>
          </section>

          {/* Section 2: Deductions & Config */}
          <section className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-2xl shadow-soft dark:shadow-none border border-border-highlight dark:border-border-dark">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-900/10">
                    <Icons.Settings size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Configurações</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup 
                  label="Descontos / Vãos (m²)" 
                  value={inputs.deduction} 
                  onChange={v => handleUpdate('deduction', v)} 
                  placeholder="Portas e Janelas"
                />
                <InputGroup 
                  label="Espaçamento Montantes (m)" 
                  value={inputs.spacing} 
                  onChange={v => handleUpdate('spacing', v)} 
                  type="select"
                  options={[
                      { label: "Standard (60cm)", value: 0.60 },
                      { label: "Reforçado (40cm)", value: 0.40 }
                  ]}
                />
             </div>

             <div className="flex flex-col md:flex-row gap-6 items-center pt-6 border-t border-border-light dark:border-border-dark">
                <InputGroup 
                  label="Preço Mão de Obra (R$/m²)" 
                  value={inputs.laborPrice} 
                  onChange={v => handleUpdate('laborPrice', v)} 
                  prefix="R$"
                />
                
                <div 
                  className="w-full flex items-center gap-3 p-3.5 bg-background-light dark:bg-slate-900 rounded-xl mt-7 cursor-pointer border border-transparent hover:border-primary-DEFAULT/30 transition-all" 
                  onClick={() => handleUpdate('hasWool', !inputs.hasWool)}
                >
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${inputs.hasWool ? 'bg-primary-DEFAULT border-primary-DEFAULT shadow-glow' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                        {inputs.hasWool && <Icons.Check size={16} className="text-white" />}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300 select-none">Incluir Lã de Vidro?</span>
                </div>
             </div>
          </section>

          {/* Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <button 
               onClick={() => handlePremiumAction('Salvar Orçamento')}
               className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-surface-dark border border-border-highlight dark:border-border-dark rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-surface-hoverDark hover:border-primary-DEFAULT dark:hover:border-primary-DEFAULT/50 transition-all shadow-sm group"
             >
                <Icons.Briefcase size={18} className="group-hover:scale-110 transition-transform text-primary-DEFAULT" /> Salvar
             </button>
             <button 
               onClick={() => handlePremiumAction('Gerar PDF')}
               className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-surface-dark border border-border-highlight dark:border-border-dark rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-surface-hoverDark hover:border-primary-DEFAULT dark:hover:border-primary-DEFAULT/50 transition-all shadow-sm group"
             >
                <Icons.Download size={18} className="group-hover:scale-110 transition-transform text-primary-DEFAULT" /> PDF
             </button>
             <button 
               onClick={() => handlePremiumAction('Enviar Proposta')}
               className="flex items-center justify-center gap-2 p-4 bg-primary-DEFAULT text-white rounded-xl font-bold shadow-lg shadow-primary-DEFAULT/30 hover:bg-primary-dark transition-all transform active:scale-95"
             >
                <Icons.Send size={18} /> Enviar Proposta
             </button>
          </div>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-1">
           <ResultCard results={results} />
        </div>
      </div>
    </div>
  );
};

export default DrywallCalculator;