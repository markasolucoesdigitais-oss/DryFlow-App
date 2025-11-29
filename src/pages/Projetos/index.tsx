import React from 'react';
import { Icons } from '../../components/Icons';

export const Projetos = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icons.Briefcase size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Gestão de Projetos</h1>
      <p className="text-xl text-gray-500 mb-8">
        Acompanhe o andamento das obras em execução.
      </p>
    </div>
  );
};