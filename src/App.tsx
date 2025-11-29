
import React, { useState, useEffect, useRef } from 'react';
import { 
  getCurrentUser, 
  saveUser, 
  getProjects, 
  saveSingleProject, 
  deleteAccount
} from './services/storage';
import { generateChecklistAdvice } from './services/gemini';
import { Project, User, Environment, MaterialItem, ServiceCategory, Task } from './types';

// --- ICONS ---
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

const Icons = {
  Lock: ({ size = 16, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Check: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>,
  User: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Sun: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Trash: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Download: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Plus: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Briefcase: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Send: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  QrCode: ({ size = 22, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Edit: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Settings: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Sparkles: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"></path></svg>,
  Circle: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle></svg>,
  Calendar: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  FileText: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>,
  Clock: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
};

const PRICE_PRO = "49,90";

// --- LOGO COMPONENT ---
// Tries to load from public/logo.png, falls back to text
const AppLogo = ({ className }: { className?: string }) => {
  const [hasLogo, setHasLogo] = useState(true);

  return (
    <div className={`flex items-center gap-2 font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white cursor-pointer select-none ${className}`}>
      {hasLogo ? (
        <img 
          src="/logo.svg" 
          alt="DF" 
          className="h-9 w-9 object-contain"
          onError={() => setHasLogo(false)} 
        />
      ) : (
        <div className="w-9 h-9 bg-gradient-to-br from-obra-green to-obra-dark text-white flex items-center justify-center rounded-xl shadow-lg shadow-green-500/20">
          DF
        </div>
      )}
      <span>DRY<span className="text-obra-green">FLOW</span></span>
    </div>
  );
};

// Helper to generate IDs safely
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// --- PREDEFINED MATERIALS ---
const MATERIAL_DB: Record<ServiceCategory, string[]> = {
  drywall: ['Placas ST', 'Placas RU (Verde)', 'Placas RF (Rosa)', 'Montantes 48mm', 'Montantes 70mm', 'Guias 48mm', 'Guias 70mm', 'Parafuso GN25', 'Parafuso Metal-Metal', 'Fita Telada', 'Fita de Papel', 'Massa Drywall (Saco)', 'Massa de acabamento (Balde)', 'Perfil F530', 'Tirantes', 'Regulador F530', 'Tabica', 'Cantoneira'],
  painting: ['Tinta Acrílica Fosca (18L)', 'Tinta Acrílica Semibrilho (18L)', 'Tinta Piso (18L)', 'Massa Corrida (Barrica)', 'Massa Acrílica (Barrica)', 'Selador Acrílico', 'Fundo Preparador', 'Lixa 120', 'Lixa 220', 'Rolo de Lã', 'Fita Crepe', 'Lona Plástica', 'Papelão Ondulado'],
  electrical: ['Fio Flexível 1.5mm', 'Fio Flexível 2.5mm', 'Fio Flexível 4.0mm', 'Fio Flexível 6.0mm', 'Cabo PP 2x1.5', 'Eletroduto Corrugado 3/4', 'Eletroduto Corrugado 1"', 'Caixa 4x2 Amarela', 'Caixa 4x4 Amarela', 'Tomada 10A', 'Tomada 20A', 'Interruptor Simples', 'Interruptor Duplo', 'Disjuntor DIN 16A', 'Disjuntor DIN 20A', 'Disjuntor DIN 40A', 'Fita Isolante', 'Spot LED 5W', 'Painel LED 18W']
};

const LoginModal = ({ onClose }: { onClose: (name: string, email: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name && email) onClose(name, email); };
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Bem-vindo</h2>
        <p className="text-slate-500 mb-6">Cadastre-se para começar a calcular.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-all" placeholder="Seu Nome" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-all" placeholder="seu@email.com" />
          </div>
          <button type="submit" className="w-full bg-obra-green hover:bg-obra-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transform hover:-translate-y-0.5 transition-all">Acessar Calculadora</button>
        </form>
      </div>
    </div>
  );
};

const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-white/10">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-700 rounded-full p-2">✕</button>
      <div className="text-center">
        <div className="bg-gradient-to-tr from-orange-100 to-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner"><span className="text-4xl">👑</span></div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Seja Profissional</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">Liberdade total para seu negócio por apenas <span className="font-bold text-obra-green">R$ {PRICE_PRO}</span> (único).</p>
        <div className="grid gap-4 text-left mb-8 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium"><div className="text-obra-green"><Icons.Check /></div><span>Salvar orçamentos ilimitados</span></div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium"><div className="text-obra-green"><Icons.Check /></div><span>Gerar PDF de Proposta Comercial</span></div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium"><div className="text-obra-green"><Icons.Check /></div><span>Gestão de Projetos e Clientes</span></div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium"><div className="text-obra-green"><Icons.Check /></div><span>Cartão Digital QR Code</span></div>
        </div>
        <button className="w-full bg-gradient-to-r from-alert-orange to-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-500/30 transform hover:scale-[1.02] transition-all">QUERO SER PRO</button>
      </div>
    </div>
  </div>
);

const DigitalCardModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
ORG:${user.companyName || ''}
TEL;TYPE=CELL:${user.phone || ''}
EMAIL:${user.email}
ADR:;;${user.city || ''};;;;
END:VCARD`;
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vcard)}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-100 dark:border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Seu Cartão Digital</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Peça para seu cliente escanear.</p>
          
          <div className="bg-white p-4 rounded-2xl shadow-soft inline-block border border-slate-100 mb-6">
             <img src={qrUrl} alt="QR Code" className="w-56 h-56" />
          </div>
          
          <div className="text-slate-700 dark:text-slate-200 space-y-1">
             <p className="font-bold text-lg">{user.name}</p>
             <p className="font-medium">{user.phone}</p>
             <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigView = ({ user, onUpdateUser, onShowPro }: { user: User, onUpdateUser: (u: User) => void, onShowPro: () => void }) => {
  const [formData, setFormData] = useState(user);
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUser(formData);
    onUpdateUser(formData);
    alert('Dados atualizados com sucesso!');
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><Icons.Settings className="text-slate-600 dark:text-slate-300"/></div> Configurações
      </h1>
      
      {showQR && <DigitalCardModal user={user} onClose={() => setShowQR(false)} />}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
           <h2 className="font-bold text-lg text-slate-900 dark:text-white">Perfil Profissional</h2>
           <p className="text-sm text-slate-500">Esses dados aparecerão nos seus orçamentos.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-shadow" 
              />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''} 
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  placeholder="Ex: Silva Construções"
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-shadow" 
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cidade / UF</label>
                <input 
                  type="text" 
                  value={formData.city || ''} 
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-shadow" 
                />
             </div>
           </div>

           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefone / WhatsApp</label>
              <input 
                type="tel" 
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 90000-0000"
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none transition-shadow" 
              />
           </div>
           
           <div className="pt-6 flex flex-col md:flex-row gap-4">
              <button type="submit" className="flex-1 bg-obra-green text-white font-bold py-3.5 rounded-xl hover:bg-obra-dark transition-colors shadow-lg shadow-green-500/20">
                 Salvar Dados
              </button>
              <button type="button" onClick={() => { if(user.isPro) setShowQR(true); else onShowPro(); }} className="flex-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                 {user.isPro ? <Icons.QrCode className="text-slate-900 dark:text-white"/> : <Icons.Lock size={14} className="text-slate-400"/>} Gerar Cartão Digital
              </button>
           </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-8">
         <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Plano e Assinatura</h2>
         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
            <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Status Atual</p>
               <p className={`text-xl font-bold ${user.isPro ? 'text-obra-green' : 'text-slate-700 dark:text-white'}`}>{user.isPro ? 'PROFISSIONAL (Vitalício)' : 'Gratuito'}</p>
            </div>
            {!user.isPro && <button onClick={onShowPro} className="px-5 py-2 rounded-lg bg-alert-orange text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-md">Fazer Upgrade</button>}
         </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CALCULATOR APP ---
const CalculatorApp = ({ user, onShowPro, onNavigate, existingProject }: { user: User | null, onShowPro: () => void, onNavigate: (tab: string) => void, existingProject?: Project | null }) => {
  const [clientName, setClientName] = useState(existingProject?.clientName || '');
  const [title, setTitle] = useState(existingProject?.title || '');
  const [address, setAddress] = useState(existingProject?.address || '');
  const [status, setStatus] = useState<Project['status']>(existingProject?.status || 'rascunho');
  const [startDate, setStartDate] = useState(existingProject?.startDate || '');
  const [activeTab, setActiveTab] = useState<'calculator' | 'checklist'>('calculator');
  const [tasks, setTasks] = useState<Task[]>(existingProject?.tasks || []);
  
  const [customMatName, setCustomMatName] = useState('');
  const [customMatQty, setCustomMatQty] = useState<number>(1);
  const [customMatUnit, setCustomMatUnit] = useState('un');

  const [envs, setEnvs] = useState<Environment[]>(existingProject?.environments || [{
    id: generateUUID(),
    name: 'Ambiente 1',
    width: 4, height: 2.7,
    hasDrywall: true, hasPainting: false, hasElectrical: false,
    drywallSubType: 'parede',
    drywallLaborPrice: 0, paintingLaborPrice: 0, electricalLaborPrice: 0,
    materials: []
  }]);

  const [showSummary, setShowSummary] = useState(false);

  // ... (Auto-calculate logic remains same) ...
  useEffect(() => {
    setEnvs(prevEnvs => prevEnvs.map(env => {
      const area = env.width * env.height;
      let newMaterials = env.materials.filter(m => !m.isAutoCalculated); 

      if (env.hasDrywall) {
        if (env.drywallSubType === 'parede') {
          newMaterials.push(
            { id: 'auto-1', category: 'drywall', name: 'Placas ST (1.20x1.80)', quantity: Math.ceil(area / 2.16 * 1.05), unit: 'un', isAutoCalculated: true },
            { id: 'auto-2', category: 'drywall', name: 'Montantes 48mm', quantity: Math.ceil(env.width / 0.6), unit: 'un', isAutoCalculated: true },
            { id: 'auto-3', category: 'drywall', name: 'Guias 48mm', quantity: Math.ceil(env.width / 3) * 2, unit: 'un', isAutoCalculated: true },
            { id: 'auto-4', category: 'drywall', name: 'Parafuso GN25', quantity: Math.ceil(area * 20), unit: 'un', isAutoCalculated: true }
          );
        } else {
           newMaterials.push(
            { id: 'auto-1', category: 'drywall', name: 'Placas ST (1.20x1.80)', quantity: Math.ceil(area / 2.16 * 1.05), unit: 'un', isAutoCalculated: true },
            { id: 'auto-2', category: 'drywall', name: 'Perfis F530', quantity: Math.ceil(area * 1.5), unit: 'un', isAutoCalculated: true },
            { id: 'auto-3', category: 'drywall', name: 'Tabica', quantity: Math.ceil((env.width + env.height) * 2 / 3), unit: 'un', isAutoCalculated: true }
          );
        }
      }

      if (env.hasPainting) {
        newMaterials.push(
          { id: 'auto-p1', category: 'painting', name: 'Tinta Acrílica (18L)', quantity: Math.ceil(area / 100), unit: 'lt', isAutoCalculated: true },
          { id: 'auto-p2', category: 'painting', name: 'Selador', quantity: Math.ceil(area / 150), unit: 'lt', isAutoCalculated: true }
        );
      }
      return { ...env, materials: newMaterials };
    }));
  }, [envs.map(e => `${e.width}-${e.height}-${e.hasDrywall}-${e.drywallSubType}-${e.hasPainting}`).join('|')]);

  const addEnv = () => {
    setEnvs([...envs, {
      id: generateUUID(),
      name: `Ambiente ${envs.length + 1}`,
      width: 4, height: 2.7,
      hasDrywall: true, hasPainting: false, hasElectrical: false,
      drywallSubType: 'parede',
      drywallLaborPrice: 0, paintingLaborPrice: 0, electricalLaborPrice: 0,
      materials: []
    }]);
  };

  const removeEnv = (id: string) => {
    if (envs.length > 1) setEnvs(envs.filter(e => e.id !== id));
  };

  const addMaterial = (envId: string, category: ServiceCategory, name: string) => {
    setEnvs(envs.map(env => {
      if (env.id !== envId) return env;
      return {
        ...env,
        materials: [...env.materials, { id: generateUUID(), category, name, quantity: 1, unit: 'un' }]
      };
    }));
  };

  const addCustomMaterial = (envId: string, category: ServiceCategory) => {
    if (!customMatName) return;
    setEnvs(envs.map(env => {
      if (env.id !== envId) return env;
      return {
        ...env,
        materials: [...env.materials, { id: generateUUID(), category, name: customMatName, quantity: customMatQty, unit: customMatUnit, isAutoCalculated: false }]
      };
    }));
    setCustomMatName('');
    setCustomMatQty(1);
    setCustomMatUnit('un');
  };

  const updateMaterialQty = (envId: string, matId: string, qty: number) => {
    setEnvs(envs.map(env => {
      if (env.id !== envId) return env;
      return {
        ...env,
        materials: env.materials.map(m => m.id === matId ? { ...m, quantity: qty } : m)
      };
    }));
  };

  const handleSave = () => {
    if (!user?.isPro) { onShowPro(); return; }
    const project: Project = {
      id: existingProject?.id || generateUUID(),
      clientId: '', clientName: clientName || 'Novo Cliente',
      title: title || 'Novo Orçamento',
      address,
      date: new Date().toISOString(),
      status, startDate,
      environments: envs,
      tasks,
      totalMaterials: 0, totalLabor: 0, grandTotal: 0 
    };
    saveSingleProject(user.id, project);
    alert('Orçamento salvo com sucesso!');
    onNavigate('projects');
  };

  const handlePrint = (type: 'proposal' | 'materials') => {
    if (!user?.isPro) { onShowPro(); return; }
    window.print(); 
  };
  
  const handleGenerateAI = async () => {
    if (!user?.isPro) { onShowPro(); return; }
    if (tasks.length > 0 && !window.confirm('Isso vai adicionar novas tarefas. Continuar?')) return;
    
    const scope = envs.map(e => 
      `${e.name}: ${e.hasDrywall ? 'Drywall' : ''} ${e.hasPainting ? 'Pintura' : ''} ${e.hasElectrical ? 'Elétrica' : ''}`
    ).join('; ');
    
    const suggestion = await generateChecklistAdvice(scope);
    const lines = suggestion.split('\n').filter(l => l.trim().length > 0);
    const newTasks: Task[] = lines.map(line => ({
      id: generateUUID(),
      text: line.replace(/^- /, '').replace(/^\d+\. /, ''),
      category: 'Geral',
      date: new Date().toISOString().split('T')[0],
      done: false
    }));
    
    setTasks([...tasks, ...newTasks]);
  };
  
  const addTask = () => {
      if (!user?.isPro) { onShowPro(); return; }
      const t = prompt("Nome da tarefa:");
      if(t) setTasks([...tasks, {id: generateUUID(), text: t, category: 'Geral', date: new Date().toISOString().split('T')[0], done: false}]);
  };
  
  const toggleTask = (tid: string) => {
      if (!user?.isPro) { onShowPro(); return; }
      setTasks(tasks.map(t => t.id === tid ? {...t, done: !t.done} : t));
  };
  
  const deleteTask = (tid: string) => {
      if (!user?.isPro) { onShowPro(); return; }
      setTasks(tasks.filter(t => t.id !== tid));
  };


  if (showSummary) {
    // ... (Calculation Logic) ...
    const totalDrywallLabor = envs.reduce((acc, e) => acc + (e.hasDrywall ? e.drywallLaborPrice : 0), 0);
    const totalPaintingLabor = envs.reduce((acc, e) => acc + (e.hasPainting ? e.paintingLaborPrice : 0), 0);
    const totalElectricalLabor = envs.reduce((acc, e) => acc + (e.hasElectrical ? e.electricalLaborPrice : 0), 0);
    
    const getMats = (cat: ServiceCategory) => {
      const all: Record<string, {name: string, qty: number, unit: string}> = {};
      envs.forEach(env => {
        env.materials.filter(m => m.category === cat).forEach(m => {
          if (!all[m.name]) all[m.name] = { name: m.name, qty: 0, unit: m.unit };
          all[m.name].qty += m.quantity;
        });
      });
      return Object.values(all);
    };

    const drywallMats = getMats('drywall');
    const paintingMats = getMats('painting');
    const electricalMats = getMats('electrical');

    return (
      <div className="max-w-4xl mx-auto pb-20 print:p-0 print:max-w-none">
        <div className="flex items-center gap-3 mb-8 no-print">
          <button onClick={() => setShowSummary(false)} className="flex items-center gap-2 text-slate-500 hover:text-obra-green font-medium transition-colors">
            <Icons.ArrowLeft /> Voltar para Edição
          </button>
          <h1 className="text-2xl font-bold ml-auto text-slate-900 dark:text-white">Resumo e Proposta</h1>
        </div>

        <div className="bg-white p-12 rounded-3xl shadow-lg border border-slate-100 print:shadow-none print:border-none print:w-full">
           <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
              <div>
                 <h1 className="text-3xl font-extrabold text-slate-900">{user?.companyName || user?.name || 'Profissional'}</h1>
                 <p className="text-slate-500 mt-1">{user?.city} • {user?.phone}</p>
                 <p className="text-slate-500">{user?.email}</p>
              </div>
              <div className="text-right">
                 <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Proposta para</div>
                 <h2 className="text-2xl font-bold text-slate-800">{clientName || 'Cliente'}</h2>
                 {address && <p className="text-sm text-slate-600 mt-1">{address}</p>}
                 <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
           </div>

           <div className="mb-10">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4">Ambientes e Serviços</h3>
              {envs.map(env => (
                <div key={env.id} className="flex justify-between py-3 border-b border-slate-50">
                   <span className="font-semibold text-slate-800 text-lg">{env.name} <span className="text-sm font-normal text-slate-500 ml-1">({env.width}x{env.height}m)</span></span>
                   <div className="text-sm font-medium text-slate-600 flex gap-2">
                     {env.hasDrywall && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">Drywall</span>}
                     {env.hasPainting && <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs">Pintura</span>}
                     {env.hasElectrical && <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs">Elétrica</span>}
                   </div>
                </div>
              ))}
           </div>

           <div className="mb-10">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4">Investimento</h3>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wide">
                      <tr><th className="p-4">Categoria</th><th className="p-4 text-right">Mão de Obra</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {drywallMats.length > 0 && <tr><td className="p-4 font-medium text-slate-700">Drywall (Forro/Parede)</td><td className="p-4 text-right font-bold text-slate-800">R$ {totalDrywallLabor.toFixed(2)}</td></tr>}
                      {paintingMats.length > 0 && <tr><td className="p-4 font-medium text-slate-700">Pintura e Acabamento</td><td className="p-4 text-right font-bold text-slate-800">R$ {totalPaintingLabor.toFixed(2)}</td></tr>}
                      {electricalMats.length > 0 && <tr><td className="p-4 font-medium text-slate-700">Instalações Elétricas</td><td className="p-4 text-right font-bold text-slate-800">R$ {totalElectricalLabor.toFixed(2)}</td></tr>}
                      <tr className="bg-slate-50/50">
                        <td className="p-4 font-bold text-lg text-slate-900">TOTAL MÃO DE OBRA</td>
                        <td className="p-4 text-right font-extrabold text-xl text-obra-green">R$ {(totalDrywallLabor + totalPaintingLabor + totalElectricalLabor).toFixed(2)}</td>
                      </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">* Materiais listados em anexo (responsabilidade do cliente ou a combinar).</p>
           </div>
            
           <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4">Cláusulas e Condições</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 leading-relaxed">
                 <li>O pagamento será realizado conforme combinado: entrada de 50% e restante na conclusão.</li>
                 <li>Validade desta proposta: 15 dias.</li>
                 <li>Materiais extras não listados serão cobrados à parte.</li>
                 <li>O local deve estar livre para início dos serviços na data agendada.</li>
                 <li>Garantia de serviço de 90 dias conforme lei vigente.</li>
              </ul>
           </div>

           <div className="mt-20 flex justify-between px-12 text-center">
              <div className="border-t border-slate-300 w-64 pt-4">
                 <p className="font-bold text-slate-800">{user?.name}</p>
                 <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Contratado</p>
              </div>
              <div className="border-t border-slate-300 w-64 pt-4">
                 <p className="font-bold text-slate-800">{clientName}</p>
                 <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Contratante</p>
              </div>
           </div>
        </div>

        {/* --- MATERIAL LISTS --- */}
        <div className="mt-8 bg-white p-12 rounded-3xl shadow-lg border border-slate-100 print:mt-10 print:break-before-page">
           <h2 className="text-2xl font-bold mb-8 text-slate-900 border-b border-slate-100 pb-4">Lista de Materiais Estimada</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 print:grid-cols-3">
              {[
                { title: 'Drywall', items: drywallMats, color: 'text-blue-600' },
                { title: 'Pintura', items: paintingMats, color: 'text-amber-600' },
                { title: 'Elétrica', items: electricalMats, color: 'text-yellow-600' }
              ].map(cat => cat.items.length > 0 && (
                <div key={cat.title}>
                   <h3 className={`font-extrabold ${cat.color} mb-4 uppercase text-sm tracking-wide`}>{cat.title}</h3>
                   <ul className="text-sm space-y-2">
                      {cat.items.map((m, i) => (
                        <li key={i} className="flex justify-between border-b border-slate-50 py-2">
                          <span className="text-slate-700 font-medium">{m.name}</span>
                          <span className="font-bold text-slate-900">{m.qty} {m.unit}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end gap-4 no-print z-40 shadow-soft">
           {status === 'rascunho' ? (
              <button onClick={() => { if(!user?.isPro) { onShowPro() } else { setStatus('aguardando_aceite'); handleSave(); } }} className="px-8 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors">
                 Enviar para Projetos
              </button>
           ) : (
              <select 
                 value={status} 
                 onChange={(e) => setStatus(e.target.value as any)}
                 className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-obra-green outline-none"
              >
                 <option value="aguardando_aceite">Aguardando Aceite</option>
                 <option value="aceito">Proposta Aceita</option>
                 <option value="em_execucao">Em Execução</option>
                 <option value="concluido">Concluído</option>
              </select>
           )}

           <button onClick={() => handlePrint('materials')} className="px-8 py-3.5 rounded-xl border-2 border-obra-green text-obra-green font-bold hover:bg-green-50 transition-colors">
              {user?.isPro ? 'Imprimir Materiais' : <span className="flex items-center gap-2"><Icons.Lock /> Lista Materiais</span>}
           </button>
           
           <button onClick={() => handlePrint('proposal')} className="px-8 py-3.5 rounded-xl bg-obra-green text-white font-bold hover:bg-obra-dark shadow-lg shadow-green-500/20 transition-all">
              {user?.isPro ? 'Imprimir Proposta' : <span className="flex items-center gap-2"><Icons.Lock /> Proposta Cliente</span>}
           </button>
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <div className="max-w-5xl mx-auto pb-24 px-4">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-obra-green transition-colors font-medium"><Icons.ArrowLeft /> <span>Painel</span></button>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Calculadora de Material</h1>
      </div>

      <div className="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-700">
         <button onClick={() => setActiveTab('calculator')} className={`pb-4 px-2 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'calculator' ? 'text-obra-green border-obra-green' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Calculadora</button>
         <button onClick={() => setActiveTab('checklist')} className={`pb-4 px-2 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'checklist' ? 'text-obra-green border-obra-green' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Checklist Obra</button>
      </div>
      
      {activeTab === 'checklist' ? (
         <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lista de Tarefas</h2>
                <button onClick={handleGenerateAI} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105 text-sm font-bold">
                   <Icons.Sparkles size={16} /> Gerar com IA
                </button>
             </div>
             
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 p-8">
                 {tasks.length === 0 && <p className="text-slate-400 text-center py-12 italic">Nenhuma tarefa. Adicione manualmente ou gere com IA.</p>}
                 <ul className="space-y-4">
                    {tasks.map(t => (
                       <li key={t.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                          <button onClick={() => toggleTask(t.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${t.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-500'}`}>
                             {t.done && <Icons.Check size={14} />}
                          </button>
                          <span className={`flex-1 font-medium ${t.done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>{t.text}</span>
                          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{t.date}</span>
                          <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><Icons.Trash size={16} /></button>
                       </li>
                    ))}
                 </ul>
                 <button onClick={addTask} className="mt-8 w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-slate-700 hover:border-slate-400 font-bold flex items-center justify-center gap-2 transition-all">
                    <Icons.Plus /> Adicionar Tarefa Manual
                 </button>
             </div>
         </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700">
             <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-6">Dados do Projeto</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Nome do Projeto (Título)</label>
                   <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reforma Sala" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none dark:text-white shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Nome do Cliente</label>
                   <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João da Silva" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none dark:text-white shadow-sm" />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Endereço da Obra</label>
                   <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-obra-green focus:border-transparent outline-none dark:text-white shadow-sm" />
                </div>
             </div>
          </div>

          {envs.map((env, index) => (
            <div key={env.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-obra-green text-white flex items-center justify-center text-sm font-bold shadow-glow">{index + 1}</span>
                    <input 
                      value={env.name} 
                      onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, name: e.target.value} : ev))}
                      className="text-xl font-bold bg-transparent text-slate-900 dark:text-white border-b-2 border-transparent hover:border-slate-300 focus:border-obra-green outline-none w-48 transition-colors"
                    />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1.5 shadow-sm">
                       <input type="number" value={env.width} onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, width: parseFloat(e.target.value)||0} : ev))} className="w-16 p-1 text-center bg-transparent font-bold text-slate-800 dark:text-white outline-none" />
                       <span className="text-slate-400 text-xs px-2 font-bold border-l border-slate-100 dark:border-slate-600">L</span>
                    </div>
                    <span className="text-slate-300 font-bold">×</span>
                    <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1.5 shadow-sm">
                       <input type="number" value={env.height} onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, height: parseFloat(e.target.value)||0} : ev))} className="w-16 p-1 text-center bg-transparent font-bold text-slate-800 dark:text-white outline-none" />
                       <span className="text-slate-400 text-xs px-2 font-bold border-l border-slate-100 dark:border-slate-600">A</span>
                    </div>
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-300 font-bold text-sm border border-green-100 dark:border-green-800/30">
                      {(env.width * env.height).toFixed(2)} m²
                    </div>
                 </div>
                 <button onClick={() => removeEnv(env.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Icons.Trash /></button>
              </div>

              <div className="p-6 flex gap-6 border-b border-slate-50 dark:border-slate-700 bg-white dark:bg-slate-800">
                 {[
                   { id: 'hasDrywall', label: 'Drywall', color: 'text-blue-600' },
                   { id: 'hasPainting', label: 'Pintura', color: 'text-amber-600' },
                   { id: 'hasElectrical', label: 'Elétrica', color: 'text-yellow-600' }
                 ].map(srv => (
                   <label key={srv.id} className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={(env as any)[srv.id]} 
                          onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, [srv.id]: e.target.checked} : ev))}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-obra-green checked:border-obra-green transition-colors"
                        />
                        <Icons.Check className="absolute text-white w-3.5 h-3.5 left-1 top-1 hidden peer-checked:block pointer-events-none" />
                      </div>
                      <span className={`font-bold ${srv.color}`}>{srv.label}</span>
                   </label>
                 ))}
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white dark:bg-slate-800">
                 {env.hasDrywall && (
                   <div className="space-y-4">
                      <h4 className="font-extrabold text-blue-600 text-xs uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div> Drywall
                      </h4>
                      <select 
                        value={env.drywallSubType}
                        onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, drywallSubType: e.target.value as any} : ev))}
                        className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                         <option value="parede">Parede / Divisória</option>
                         <option value="teto">Forro / Rebaixo</option>
                      </select>
                      
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                         <label className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wide">Mão de Obra (Total)</label>
                         <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg mt-2 border border-blue-200 dark:border-blue-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                            <span className="pl-3 text-slate-500 font-medium">R$</span>
                            <input 
                              type="number" 
                              value={env.drywallLaborPrice} 
                              onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, drywallLaborPrice: parseFloat(e.target.value)||0} : ev))}
                              className="w-full p-2.5 bg-transparent outline-none font-bold text-slate-800 dark:text-white" 
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Materiais</p>
                         {env.materials.filter(m => m.category === 'drywall').map(m => (
                           <div key={m.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                              <input 
                                type="number" 
                                value={m.quantity} 
                                onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                                className="w-14 text-center bg-white dark:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-500 p-1 font-bold text-slate-800 dark:text-white text-xs"
                              />
                           </div>
                         ))}
                         <select 
                           onChange={e => { if(e.target.value) addMaterial(env.id, 'drywall', e.target.value); e.target.value=''; }}
                           className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-300 font-medium hover:border-slate-300"
                         >
                            <option value="">+ Adicionar Item</option>
                            {MATERIAL_DB.drywall.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                         
                         <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                               <input placeholder="Nome" value={customMatName} onChange={e => setCustomMatName(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-blue-500" />
                               <input type="number" placeholder="Qtd" value={customMatQty} onChange={e => setCustomMatQty(parseFloat(e.target.value))} className="w-14 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-blue-500" />
                               <button onClick={() => addCustomMaterial(env.id, 'drywall')} className="bg-blue-600 text-white text-xs px-3 rounded-lg hover:bg-blue-700 font-bold"><Icons.Plus size={14} /></button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {env.hasPainting && (
                   <div className="space-y-4">
                      <h4 className="font-extrabold text-amber-600 text-xs uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600"></div> Pintura
                      </h4>
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                         <label className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wide">Mão de Obra (Total)</label>
                         <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg mt-2 border border-amber-200 dark:border-amber-700 shadow-sm focus-within:ring-2 focus-within:ring-amber-500">
                            <span className="pl-3 text-slate-500 font-medium">R$</span>
                            <input 
                              type="number" 
                              value={env.paintingLaborPrice} 
                              onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, paintingLaborPrice: parseFloat(e.target.value)||0} : ev))}
                              className="w-full p-2.5 bg-transparent outline-none font-bold text-slate-800 dark:text-white" 
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Materiais</p>
                         {env.materials.filter(m => m.category === 'painting').map(m => (
                           <div key={m.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                              <input 
                                type="number" 
                                value={m.quantity} 
                                onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                                className="w-14 text-center bg-white dark:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-500 p-1 font-bold text-slate-800 dark:text-white text-xs"
                              />
                           </div>
                         ))}
                         <select 
                           onChange={e => { if(e.target.value) addMaterial(env.id, 'painting', e.target.value); e.target.value=''; }}
                           className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-300 font-medium hover:border-slate-300"
                         >
                            <option value="">+ Adicionar Item</option>
                            {MATERIAL_DB.painting.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                         <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                               <input placeholder="Nome" value={customMatName} onChange={e => setCustomMatName(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-amber-500" />
                               <input type="number" placeholder="Qtd" value={customMatQty} onChange={e => setCustomMatQty(parseFloat(e.target.value))} className="w-14 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-amber-500" />
                               <button onClick={() => addCustomMaterial(env.id, 'painting')} className="bg-amber-600 text-white text-xs px-3 rounded-lg hover:bg-amber-700 font-bold"><Icons.Plus size={14} /></button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {env.hasElectrical && (
                   <div className="space-y-4">
                      <h4 className="font-extrabold text-yellow-600 text-xs uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-600"></div> Elétrica
                      </h4>
                      <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
                         <label className="text-xs text-yellow-800 dark:text-yellow-300 font-bold uppercase tracking-wide">Mão de Obra (Total)</label>
                         <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg mt-2 border border-yellow-200 dark:border-yellow-700 shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
                            <span className="pl-3 text-slate-500 font-medium">R$</span>
                            <input 
                              type="number" 
                              value={env.electricalLaborPrice} 
                              onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, electricalLaborPrice: parseFloat(e.target.value)||0} : ev))}
                              className="w-full p-2.5 bg-transparent outline-none font-bold text-slate-800 dark:text-white" 
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Materiais</p>
                         {env.materials.filter(m => m.category === 'electrical').map(m => (
                           <div key={m.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                              <input 
                                type="number" 
                                value={m.quantity} 
                                onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                                className="w-14 text-center bg-white dark:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-500 p-1 font-bold text-slate-800 dark:text-white text-xs"
                              />
                           </div>
                         ))}
                         <select 
                           onChange={e => { if(e.target.value) addMaterial(env.id, 'electrical', e.target.value); e.target.value=''; }}
                           className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-300 font-medium hover:border-slate-300"
                         >
                            <option value="">+ Adicionar Item</option>
                            {MATERIAL_DB.electrical.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                         <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                               <input placeholder="Nome" value={customMatName} onChange={e => setCustomMatName(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-yellow-500" />
                               <input type="number" placeholder="Qtd" value={customMatQty} onChange={e => setCustomMatQty(parseFloat(e.target.value))} className="w-14 text-xs p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-700 outline-none focus:border-yellow-500" />
                               <button onClick={() => addCustomMaterial(env.id, 'electrical')} className="bg-yellow-600 text-white text-xs px-3 rounded-lg hover:bg-yellow-700 font-bold"><Icons.Plus size={14} /></button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          ))}
          
          <button onClick={addEnv} className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 hover:text-obra-green hover:border-obra-green hover:bg-green-50/50 transition-all font-bold flex items-center justify-center gap-3 group">
             <div className="p-2 rounded-full bg-slate-100 group-hover:bg-obra-green group-hover:text-white transition-colors"><Icons.Plus /></div>
             Adicionar Outro Ambiente
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center z-40 shadow-soft">
        <div className="text-sm">
           <span className="text-slate-500 font-medium">Total Mão de Obra:</span>
           <span className="font-extrabold text-xl ml-2 text-slate-900 dark:text-white">R$ {envs.reduce((a,e) => a + e.drywallLaborPrice + e.paintingLaborPrice + e.electricalLaborPrice, 0).toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
           <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors">
             Salvar
           </button>
           <button onClick={() => setShowSummary(true)} className="px-6 py-3 rounded-xl bg-obra-green text-white font-bold hover:bg-obra-dark shadow-lg shadow-green-500/20 transition-all">
             Ver Resumo e Finalizar
           </button>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ user, onNavigate, onShowPro, onFilter }: { user: User, onNavigate: (tab: string) => void, onShowPro: () => void, onFilter: (s: string) => void }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [myDayTasks, setMyDayTasks] = useState<Array<{id: string, text: string, done: boolean}>>([
      { id: '1', text: "Ligar para cliente da obra Vila Nova", done: false },
      { id: '2', text: "Comprar parafusos GN25", done: true },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => { setProjects(getProjects(user.id)); }, [user]);

  const addTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTaskText.trim()) return;
      setMyDayTasks([...myDayTasks, { id: Date.now().toString(), text: newTaskText, done: false }]);
      setNewTaskText('');
  };

  const toggleTask = (id: string) => {
      setMyDayTasks(myDayTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Painel</h1>
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span className="capitalize">{new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric'})}</span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span>Olá, {user.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* --- MEU DIA --- */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden mb-10 transition-transform hover:shadow-lg">
        <div className="p-8 bg-cover bg-center relative">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 dark:from-emerald-900/10 dark:to-blue-900/10"></div>
           <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Meu Dia</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              
              <div className="space-y-3 mb-6">
                 {myDayTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-4 bg-white/60 dark:bg-slate-700/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-slate-600 hover:shadow-sm transition-all group">
                       <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-400 hover:border-blue-500'}`}>
                          {task.done && <Icons.Check size={14} />}
                       </button>
                       <span className={`flex-1 font-medium text-lg ${task.done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800 dark:text-white'}`}>{task.text}</span>
                       <button onClick={() => setMyDayTasks(myDayTasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><Icons.Trash size={16} /></button>
                    </div>
                 ))}
              </div>

              <form onSubmit={addTask} className="relative group">
                 <div className="absolute left-4 top-4 text-blue-500 transition-transform group-focus-within:scale-110"><Icons.Plus size={24} /></div>
                 <input 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Adicionar uma tarefa" 
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/80 dark:bg-slate-700/80 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:shadow-lg transition-all outline-none placeholder-blue-500/70 text-slate-800 dark:text-white font-medium text-lg"
                 />
              </form>
           </div>
        </div>
      </div>

      {/* --- DASHBOARD CARDS (UPDATED) --- */}
      <div className="grid grid-cols-3 gap-6 mb-10">
         {[
           { label: 'Em Cotação', val: projects.filter(p => p.status === 'rascunho').length, icon: <Icons.FileText size={28} />, color: 'text-blue-600', shadow: 'hover:shadow-blue-900/5', bg: 'bg-blue-50', border: 'border-blue-500', filter: 'rascunho' },
           { label: 'Aguardando', val: projects.filter(p => p.status === 'aguardando_aceite').length, icon: <Icons.Clock size={28} />, color: 'text-amber-600', shadow: 'hover:shadow-amber-900/5', bg: 'bg-amber-50', border: 'border-amber-500', filter: 'aguardando_aceite' },
           { label: 'Aprovados', val: projects.filter(p => p.status === 'aceito' || p.status === 'em_execucao').length, icon: <Icons.Check size={28} />, color: 'text-emerald-600', shadow: 'hover:shadow-emerald-900/5', bg: 'bg-emerald-50', border: 'border-emerald-500', filter: 'aprovados' }
         ].map((stat, i) => (
           <button key={i} onClick={() => { onFilter(stat.filter); onNavigate('projects'); }} className={`text-left bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 hover:-translate-y-2 hover:shadow-2xl ${stat.shadow} transition-all duration-300 h-full flex flex-col justify-between group overflow-hidden relative border-b-4 ${stat.border}`}>
              <div className="flex justify-between items-start mb-6 z-10 relative">
                 <span className={`text-xs font-extrabold uppercase tracking-wide ${stat.color} bg-opacity-10 px-3 py-1.5 rounded-lg ${stat.bg}`}>{stat.label}</span>
                 <div className={`${stat.color} p-3 rounded-2xl ${stat.bg} dark:bg-opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 shadow-inner bg-gradient-to-br from-white to-transparent`}>
                    {stat.icon}
                 </div>
              </div>
              <div className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white z-10 relative tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.val}</div>
           </button>
         ))}
      </div>

      {/* --- QUICK ACTIONS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <button onClick={() => onNavigate('calculator')} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex items-center gap-6 hover:border-obra-green/30 hover:shadow-xl transition-all group text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-obra-green shadow-inner group-hover:scale-110 transition-transform relative z-10"><Icons.Plus size={32} /></div>
            <div className="relative z-10">
               <div className="font-bold text-xl text-slate-900 dark:text-white">Novo Orçamento</div>
               <div className="text-sm font-medium text-slate-500">Calculadora completa</div>
            </div>
         </button>
         <button onClick={() => { onFilter('all'); onNavigate('projects'); }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex items-center gap-6 hover:border-blue-500/30 hover:shadow-xl transition-all group text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform relative z-10"><Icons.Briefcase size={28} /></div>
            <div className="relative z-10">
               <div className="font-bold text-xl text-slate-900 dark:text-white">Ver Projetos</div>
               <div className="text-sm font-medium text-slate-500">Gestão de obras</div>
            </div>
         </button>
      </div>
    </div>
  );
};

const ProjectsView = ({ user, onEdit, filter }: { user: User, onEdit: (p: Project) => void, filter: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { setProjects(getProjects(user.id)); }, [user]);

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'aceito': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'aguardando_aceite': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'concluido': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'aprovados') return ['aceito', 'em_execucao', 'concluido'].includes(p.status);
    return p.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto py-10">
       <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Projetos</h1>
          {filter !== 'all' && <span className="text-xs font-bold uppercase px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 tracking-wide">Filtro: {filter}</span>}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
               <div className="text-slate-300 mb-4 inline-block p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full"><Icons.Briefcase size={48} /></div>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Nenhum projeto encontrado.</p>
               {!user.isPro && <p className="text-xs font-bold text-alert-orange mt-2 uppercase tracking-wide">Funcionalidade exclusiva PRO</p>}
            </div>
          )}
          
          {filteredProjects.map(p => (
             <div key={p.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all relative group overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${p.status === 'aceito' ? 'bg-emerald-500' : p.status === 'aguardando_aceite' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                      <span className={`text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-lg border ${getStatusColor(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mt-3 truncate max-w-[220px]">{p.title}</h3>
                   </div>
                   <button onClick={() => onEdit(p)} className="text-slate-400 hover:text-white hover:bg-obra-green transition-all p-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700" title="Editar Projeto">
                      <Icons.Edit size={20} />
                   </button>
                </div>
                
                <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 relative z-10">
                   <div className="flex items-center gap-3">
                      <Icons.User size={16} className="text-slate-400" />
                      <span className="truncate font-medium">{p.clientName}</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <Icons.Calendar size={16} className="text-slate-400" />
                       <span className="text-xs font-medium">Criado em: {new Date(p.date).toLocaleDateString('pt-BR')}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- APP SHELL ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('landing');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) { setUser(sessionUser); setActiveTab('dashboard'); }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const handleStart = () => {
    const sessionUser = getCurrentUser();
    if (sessionUser) { setUser(sessionUser); setActiveTab('dashboard'); } else { setShowLoginModal(true); }
  };

  const handleLogin = (name: string, email: string) => {
    const newUser: User = { id: generateUUID(), name, email, isPro: false };
    saveUser(newUser); setUser(newUser); setShowLoginModal(false); setActiveTab('dashboard');
  };

  // --- LANDING PAGE ---
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {showLoginModal && <LoginModal onClose={handleLogin} />}
        <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10 max-w-7xl mx-auto left-0 right-0">
          <AppLogo />
          <button onClick={handleStart} className="font-bold text-slate-700 dark:text-slate-200 hover:text-obra-green transition-colors text-lg">Entrar →</button>
        </header>
        <div className="max-w-4xl text-center z-10 relative">
          <div className="inline-block px-5 py-2 rounded-full bg-green-50 dark:bg-green-900/30 text-obra-green text-sm font-extrabold mb-8 border border-green-100 dark:border-green-800 uppercase tracking-wide shadow-sm">Ferramenta do Profissional</div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">Calculadora de Drywall <br/>e Pintura <span className="text-obra-green relative inline-block">sem enrolação<svg className="absolute w-full h-3 -bottom-1 left-0 text-green-200 dark:text-green-900/40 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg></span>.</h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">Faça orçamentos completos de Drywall, Pintura e Elétrica grátis. Gestão PRO por apenas R$ 49,90.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={handleStart} className="bg-obra-green hover:bg-obra-dark text-white text-lg font-bold py-5 px-12 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95">Usar calculadora grátis</button>
            <button onClick={handleStart} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold py-5 px-12 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">Quero ser PRO (vitalício)</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans print:bg-white selection:bg-green-200 selection:text-green-900">
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 print:hidden transition-all">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div onClick={() => setActiveTab('dashboard')}>
             <AppLogo className="text-xl" />
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-700/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
            {[{id:'dashboard', l:'Painel'}, {id:'projects', l:'Projetos'}, {id:'calculator', l:'Calculadora'}, {id:'config', l:'Config'}].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(tab.id==='calculator') setEditingProject(null); if(tab.id==='projects') setProjectFilter('all'); }} className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab===tab.id ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>{tab.l}</button>
            ))}
          </div>
          {/* Mobile Nav Placeholder - Simplified for brevity */}
          <div className="flex items-center gap-5">
             <button onClick={() => setTheme(p => p==='light'?'dark':'light')} className="text-slate-400 hover:text-obra-green transition-colors">{theme==='light'?<Icons.Moon />:<Icons.Sun />}</button>
             {user?.isPro ? <span className="text-[10px] font-extrabold bg-gradient-to-r from-alert-orange to-orange-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/30 tracking-wide">PRO</span> : <button onClick={() => setShowProModal(true)} className="text-sm font-extrabold text-alert-orange hover:text-orange-600 transition-colors">SEJA PRO</button>}
          </div>
        </div>
        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 px-4 pb-3 border-t border-slate-100 dark:border-slate-700 pt-3">
            {[{id:'dashboard', l:'Painel'}, {id:'projects', l:'Projetos'}, {id:'calculator', l:'Calc'}, {id:'config', l:'Config'}].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(tab.id==='calculator') setEditingProject(null); if(tab.id==='projects') setProjectFilter('all'); }} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap ${activeTab===tab.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}>{tab.l}</button>
            ))}
        </div>
      </nav>

      <main className="p-4 md:p-6 animate-fade-in print:p-0">
        {activeTab === 'dashboard' && <DashboardView user={user!} onShowPro={() => setShowProModal(true)} onNavigate={setActiveTab} onFilter={setProjectFilter} />}
        {activeTab === 'projects' && <ProjectsView user={user!} onEdit={(p) => { setEditingProject(p); setActiveTab('calculator'); }} filter={projectFilter} />}
        {activeTab === 'calculator' && <CalculatorApp user={user} onShowPro={() => setShowProModal(true)} onNavigate={setActiveTab} existingProject={editingProject} />}
        {activeTab === 'config' && <ConfigView user={user!} onUpdateUser={setUser} onShowPro={() => setShowProModal(true)} />}
      </main>
    </div>
  );
}
