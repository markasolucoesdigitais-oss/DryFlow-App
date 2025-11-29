import React from 'react';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';

export const MeuDia = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">Meu Dia</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-10 text-center border border-blue-200 dark:border-gray-800 shadow-sm">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
           <Icons.Sun size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Tudo limpo por aqui</h3>
        <p className="text-gray-500">Adicione tarefas para organizar seu dia de trabalho.</p>
        <button className="mt-6 px-6 py-2 bg-primary-DEFAULT/10 text-primary-DEFAULT rounded-lg font-bold hover:bg-primary-DEFAULT/20 transition-colors">
           + Adicionar Tarefa
        </button>
      </div>
    </div>
  );
};