import React from 'react';
import { Icons } from '../../components/Icons';

export const Orcamentos = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icons.List size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Seus Orçamentos</h1>
      <p className="text-xl text-gray-500 mb-8">
        Gerencie propostas enviadas, aguardando aprovação e aprovadas.
      </p>
    </div>
  );
};