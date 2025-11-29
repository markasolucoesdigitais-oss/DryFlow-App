import React from 'react';
import { Icons } from '../../components/Icons';

export const Clientes = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icons.User size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Carteira de Clientes</h1>
      <p className="text-xl text-gray-500 mb-8">
        Organize contatos, histórico de obras e notas sobre seus clientes.
      </p>
    </div>
  );
};