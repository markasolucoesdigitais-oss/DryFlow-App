import React from 'react';
import { Icons } from '../../components/Icons';

export const Colaboradores = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icons.User size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Equipe e Colaboradores</h1>
      <p className="text-xl text-gray-500 mb-8">
        Gerencie sua equipe, atribua tarefas e controle pagamentos.
      </p>
    </div>
  );
};