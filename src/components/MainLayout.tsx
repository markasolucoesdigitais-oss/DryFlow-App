import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

interface MainLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navItems = [
    { id: 'home', label: 'Início', icon: <Icons.Dashboard /> },
    { id: 'meudia', label: 'Meu Dia', icon: <Icons.Sun /> },
    { id: 'calculadoras', label: 'Calculadoras', icon: <Icons.Edit /> },
    { id: 'orcamentos', label: 'Orçamentos', icon: <Icons.List /> },
    { id: 'projetos', label: 'Projetos', icon: <Icons.Briefcase /> },
    { id: 'clientes', label: 'Clientes', icon: <Icons.User /> },
    { id: 'colaboradores', label: 'Colaboradores', icon: <Icons.User /> },
  ];

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-text-darkMain overflow-hidden font-sans transition-colors duration-300 selection:bg-primary-DEFAULT selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl md:shadow-none flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border-light dark:border-border-dark/50">
          <div className="w-8 h-8 bg-primary-DEFAULT text-white rounded-lg flex items-center justify-center font-bold shadow-lg shadow-primary-DEFAULT/20">DF</div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">DRYFLOW</span>
        </div>

        {/* User Profile Summary */}
        <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-border-light dark:border-border-dark group hover:border-primary-DEFAULT/30 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary-DEFAULT text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-slate-800 dark:text-gray-100 group-hover:text-primary-DEFAULT transition-colors">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
            </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                activePage === item.id 
                  ? 'bg-blue-50 dark:bg-primary-DEFAULT/15 text-primary-DEFAULT dark:text-blue-100 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {activePage === item.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-DEFAULT rounded-r-full"></div>
              )}
              <span className={`relative z-10 transition-colors ${activePage === item.id ? 'text-primary-DEFAULT dark:text-blue-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400 w-full rounded-xl transition-colors">
             <span className="rotate-180"><Icons.Send size={18} /></span> Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative transition-colors duration-300">
        
        {/* Unified Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-primary-DEFAULT dark:bg-surface-dark/80 dark:backdrop-blur-md sticky top-0 z-30 shadow-md border-b border-transparent dark:border-border-dark transition-all">
           <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <Icons.Menu className="text-white dark:text-slate-300" />
             </button>
             
             {/* Mobile Logo Text */}
             <span className="md:hidden font-bold text-white text-lg tracking-wide">DRYFLOW</span>
             
             {/* Context Title */}
             <div className="hidden md:flex flex-col">
                <span className="font-bold text-white dark:text-white text-lg leading-tight">
                    {activePage === 'meudia' ? 'Meu Dia' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
                </span>
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button
                  onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white/90 bg-white/10 hover:bg-white/20 dark:text-slate-400 dark:bg-transparent dark:hover:text-yellow-400 dark:hover:bg-slate-800 transition-all border border-transparent dark:border-border-dark"
                  aria-label="Alternar Tema"
              >
                  {theme === 'light' ? <Icons.Moon size={18} /> : <Icons.Sun size={18} />}
              </button>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
           <div className="max-w-6xl mx-auto animate-fade-in pb-12">
              {children}
           </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};