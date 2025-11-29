import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../components/Icons';

export const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const todayDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
             {greeting()}, {user?.name?.split(' ')[0]}
           </h1>
           <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
             Visão geral do seu negócio hoje.
           </p>
        </div>
        <button onClick={() => onNavigate('calculadoras')} className="bg-primary-DEFAULT text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-DEFAULT/30 hover:bg-primary-dark transition-all transform hover:scale-[1.02] flex items-center gap-2 active:scale-95">
           <Icons.Plus /> Novo Orçamento
        </button>
      </div>

      {/* MEU DIA - Summary Card */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-float dark:shadow-none border border-border-highlight dark:border-border-dark overflow-hidden relative group cursor-pointer transition-all hover:border-primary-DEFAULT/50" onClick={() => onNavigate('meudia')}>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent dark:from-primary-DEFAULT/10 pointer-events-none rounded-bl-full opacity-60 transition-opacity group-hover:opacity-100"></div>
        
        <div className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-primary-DEFAULT/20 rounded-lg text-primary-DEFAULT">
                  <Icons.Sun size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Dia</h2>
             </div>
             <p className="text-slate-500 dark:text-slate-400 capitalize text-lg font-medium">{todayDate}</p>
             
             <div className="mt-6 flex gap-4">
               <button className="text-sm font-bold text-primary-DEFAULT hover:text-primary-dark flex items-center gap-1 transition-colors">
                 Planejar agora <Icons.ArrowLeft className="rotate-180" size={14} />
               </button>
             </div>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-10">
             <div className="text-center">
                <span className="block text-4xl font-extrabold text-slate-800 dark:text-white mb-1">3</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarefas</span>
             </div>
             <div className="text-center">
                <span className="block text-4xl font-extrabold text-slate-800 dark:text-white mb-1">2</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lembretes</span>
             </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div onClick={() => onNavigate('projetos')} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-card dark:shadow-none cursor-pointer border border-border-highlight dark:border-border-dark hover:border-primary-DEFAULT dark:hover:border-primary-DEFAULT transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-primary-DEFAULT/20 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform shadow-inner">
                  <Icons.Briefcase />
               </div>
               <span className="text-4xl font-bold text-slate-900 dark:text-white">3</span>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide relative z-10 group-hover:text-primary-DEFAULT transition-colors">Projetos Ativos</p>
         </div>

         <div onClick={() => onNavigate('orcamentos')} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-card dark:shadow-none cursor-pointer border border-border-highlight dark:border-border-dark hover:border-amber-500 dark:hover:border-amber-500 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-inner">
                  <Icons.List />
               </div>
               <span className="text-4xl font-bold text-slate-900 dark:text-white">5</span>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide relative z-10 group-hover:text-amber-600 transition-colors">Orçamentos Pendentes</p>
         </div>
      </div>

      {/* Shortcuts */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 pl-1">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { id: 'calculadoras', label: 'Calculadoras', icon: <Icons.Edit />, color: 'text-primary-DEFAULT', bg: 'bg-blue-50 dark:bg-primary-DEFAULT/10' },
             { id: 'clientes', label: 'Clientes', icon: <Icons.User />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
             { id: 'colaboradores', label: 'Colaboradores', icon: <Icons.User />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
             { id: 'meudia', label: 'Minha Agenda', icon: <Icons.Sun />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/10' },
           ].map(action => (
             <button 
               key={action.id} 
               onClick={() => onNavigate(action.id)}
               className="flex flex-col items-center justify-center p-6 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm dark:shadow-none border border-border-highlight dark:border-border-dark hover:shadow-md hover:border-primary-DEFAULT/50 dark:hover:bg-surface-hoverDark transition-all gap-4 group"
             >
                <div className={`${action.color} ${action.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>{action.icon}</div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{action.label}</span>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};