import "./globals.css";
import React, { useState } from 'react';
import "./globals.css";
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';
import { UpgradeModal } from './components/UpgradeModal';
import { usePremiumGate } from './hooks/usePremiumGate';
import { saveUser, upgradeUserToPro } from './services/storage';

// Pages
import { Home } from './pages/Home';
import { Calculadoras } from './pages/Calculadoras';
import { Orcamentos } from './pages/Orcamentos';
import { Projetos } from './pages/Projetos';
import { Clientes } from './pages/Clientes';
import { Colaboradores } from './pages/Colaboradores';
import { MeuDia } from './pages/MeuDia';

const AppContent = () => {
  const { user, login, googleLogin, isAuthenticated, updateUser } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const { isModalOpen, closeModal } = usePremiumGate();
  
  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(loginName && loginEmail) login(loginName, loginEmail);
  };

  const handleUpgrade = () => {
    if (user) {
      const upgraded = upgradeUserToPro(user.id);
      if (upgraded) updateUser(upgraded);
      closeModal();
      alert('Parabéns! Você agora é Premium.');
    }
  };

  if (!isAuthenticated) {
    return (
       <div className="min-h-screen bg-surface-light dark:bg-background-dark flex items-center justify-center p-4">
         <div className="w-full max-w-md bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
               <h1 className="text-3xl font-extrabold text-primary-DEFAULT mb-2">DRYFLOW</h1>
               <p className="text-gray-500">Gestão Profissional para Construção</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                 <input 
                   required
                   value={loginName}
                   onChange={e => setLoginName(e.target.value)}
                   className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                   placeholder="Seu nome"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                 <input 
                   required
                   type="email"
                   value={loginEmail}
                   onChange={e => setLoginEmail(e.target.value)}
                   className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                   placeholder="seu@email.com"
                 />
               </div>
               <button type="submit" className="w-full bg-primary-DEFAULT hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all">
                 Entrar
               </button>
            </form>

            <div className="mt-6">
               <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-surface-dark text-gray-500">ou</span></div>
               </div>
               <button 
                 onClick={googleLogin}
                 className="mt-6 w-full bg-white dark:bg-surface-hoverDark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                 Entrar com Google
               </button>
            </div>
         </div>
       </div>
    );
  }

  return (
    <MainLayout activePage={activePage} onNavigate={setActivePage}>
      {isModalOpen && <UpgradeModal onClose={closeModal} onUpgrade={handleUpgrade} />}
      
      {activePage === 'home' && <Home onNavigate={setActivePage} />}
      {activePage === 'calculadoras' && <Calculadoras />}
      {activePage === 'orcamentos' && <Orcamentos />}
      {activePage === 'projetos' && <Projetos />}
      {activePage === 'clientes' && <Clientes />}
      {activePage === 'colaboradores' && <Colaboradores />}
      {activePage === 'meudia' && <MeuDia />}
    </MainLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}