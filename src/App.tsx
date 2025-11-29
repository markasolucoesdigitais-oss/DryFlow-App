
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  getCurrentUser, 
  saveUser, 
  getProjects, 
  saveSingleProject,
  deleteProject
} from './services/storage';
import { Project, User, Environment, ServiceCategory, Task } from './types';

// --- API ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- ICONS ---
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };
const Icons = {
  Menu: ({ size = 24, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Lock: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
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
  Edit: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Settings: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Sparkles: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"></path></svg>,
  Calendar: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  FileText: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>,
  Clock: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Home: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Search: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  X: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  ChevronRight: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const PRICE_PRO = "49,90";

const MATERIAL_DB: Record<ServiceCategory, string[]> = {
  drywall: ['Placas ST', 'Placas RU (Verde)', 'Placas RF (Rosa)', 'Montantes 48mm', 'Montantes 70mm', 'Guias 48mm', 'Guias 70mm', 'Parafuso GN25', 'Parafuso Metal-Metal', 'Fita Telada', 'Fita de Papel', 'Massa Drywall (Saco)', 'Massa de acabamento (Balde)', 'Perfil F530', 'Tirantes', 'Regulador F530', 'Tabica', 'Cantoneira'],
  painting: ['Tinta Acrílica Fosca (18L)', 'Tinta Acrílica Semibrilho (18L)', 'Tinta Piso (18L)', 'Massa Corrida (Barrica)', 'Massa Acrílica (Barrica)', 'Selador Acrílico', 'Fundo Preparador', 'Lixa 120', 'Lixa 220', 'Rolo de Lã', 'Fita Crepe', 'Lona Plástica', 'Papelão Ondulado'],
  electrical: ['Fio Flexível 1.5mm', 'Fio Flexível 2.5mm', 'Fio Flexível 4.0mm', 'Fio Flexível 6.0mm', 'Cabo PP 2x1.5', 'Eletroduto Corrugado 3/4', 'Eletroduto Corrugado 1"', 'Caixa 4x2 Amarela', 'Caixa 4x4 Amarela', 'Tomada 10A', 'Tomada 20A', 'Interruptor Simples', 'Interruptor Duplo', 'Disjuntor DIN 16A', 'Disjuntor DIN 20A', 'Disjuntor DIN 40A', 'Fita Isolante', 'Spot LED 5W', 'Painel LED 18W']
};

const generateUUID = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

const AppLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img src="/logo.png" alt="DRYFLOW" className="h-9 w-auto object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
    <span className="hidden text-xl font-bold text-gray-800 tracking-tight dark:text-white">DRYFLOW</span>
  </div>
);

// --- MODALS ---
const LoginModal = ({ onClose }: { onClose: (name: string, email: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name && email) onClose(name, email); };
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-white/40 dark:border-slate-700 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Bem-vindo</h2>
        <p className="text-slate-500 mb-8 font-light">Cadastre-se para começar a calcular.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border-none bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green transition-all" placeholder="Seu Nome" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border-none bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green transition-all" placeholder="Seu E-mail" />
          <button type="submit" className="w-full bg-obra-green hover:bg-obra-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-transform active:scale-95">Acessar Calculadora</button>
        </form>
      </div>
    </div>
  );
};

const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">✕</button>
      <div className="text-center pt-4">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><span className="text-5xl">👑</span></div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Seja Profissional</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg font-light leading-relaxed">Desbloqueie PDF, histórico ilimitado e gestão completa por apenas <span className="font-bold text-obra-green">R$ {PRICE_PRO}</span>.</p>
        <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/30 transition-transform hover:scale-[1.02]">QUERO SER PRO</button>
      </div>
    </div>
  </div>
);

const DigitalCardModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nORG:${user.companyName || ''}\nTEL;TYPE=CELL:${user.phone || ''}\nEMAIL:${user.email}\nADR:;;${user.city || ''};;;;\nEND:VCARD`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vcard)}`;
  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cartão Digital</h2>
          <div className="bg-white p-4 rounded-2xl shadow-lg inline-block border border-slate-100 mb-6">
             <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
          </div>
          <p className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</p>
        </div>
      </div>
    </div>
  );
};

// --- VIEWS ---

const ConfigView = ({ user, onUpdateUser, onShowPro }: { user: User, onUpdateUser: (u: User) => void, onShowPro: () => void }) => {
  const [formData, setFormData] = useState(user);
  const [showQR, setShowQR] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); saveUser(formData); onUpdateUser(formData); alert('Dados salvos!'); };
  return (
    <div className="p-8 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
      {showQR && <DigitalCardModal user={user} onClose={() => setShowQR(false)} />}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nome</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Empresa</label><input value={formData.companyName||''} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Cidade</label><input value={formData.city||''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
           </div>
           <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-obra-green text-white font-bold py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-all">Salvar</button>
              <button type="button" onClick={() => { if(user.isPro) setShowQR(true); else onShowPro(); }} className="text-gray-600 dark:text-gray-300 font-bold hover:text-gray-900 px-4">Cartão Digital</button>
           </div>
        </form>
      </div>
    </div>
  );
};

const CalculatorApp = ({ user, onShowPro, onNavigate, existingProject }: any) => {
  const [clientName, setClientName] = useState(existingProject?.clientName || '');
  const [title, setTitle] = useState(existingProject?.title || '');
  const [status, setStatus] = useState<Project['status']>(existingProject?.status || 'rascunho');
  const [envs, setEnvs] = useState<Environment[]>(existingProject?.environments || [{ id: generateUUID(), name: 'Ambiente 1', width: 4, height: 2.7, hasDrywall: true, hasPainting: false, hasElectrical: false, drywallSubType: 'parede', drywallLaborPrice: 0, paintingLaborPrice: 0, electricalLaborPrice: 0, materials: [] }]);
  
  const handleSave = () => { if (!user?.isPro) { onShowPro(); return; } saveSingleProject(user.id, { id: existingProject?.id || generateUUID(), clientId: '', clientName: clientName || 'Novo Cliente', title: title || 'Novo Orçamento', date: new Date().toISOString(), status, environments: envs, totalMaterials: 0, totalLabor: 0, grandTotal: 0 }); alert('Salvo!'); onNavigate('dashboard'); };

  return (
    <div className="absolute inset-0 bg-[#faf9f8] dark:bg-slate-900 z-50 overflow-y-auto animate-fade-in">
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><Icons.ArrowLeft /></button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calculadora</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Cliente</label>
                        <input value={clientName} onChange={e=>setClientName(e.target.value)} className="w-full text-lg font-medium border-b border-gray-200 focus:border-obra-green outline-none pb-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-300" placeholder="Nome do Cliente" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Projeto</label>
                        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full text-lg font-medium border-b border-gray-200 focus:border-obra-green outline-none pb-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-300" placeholder="Nome do Projeto" />
                    </div>
                 </div>
            </div>

            <div className="space-y-6">
                {envs.map((env, i) => (
                    <div key={env.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                        <button onClick={() => { if(envs.length>1) setEnvs(envs.filter(e=>e.id!==env.id)) }} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash /></button>
                        <div className="flex items-end gap-4 mb-6">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Ambiente {i+1}</label>
                                <input value={env.name} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,name:e.target.value}:ev))} className="text-xl font-bold bg-transparent outline-none text-gray-800 dark:text-white w-full" />
                            </div>
                            <div className="flex gap-2 items-end bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                                <input type="number" value={env.width} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,width:parseFloat(e.target.value)||0}:ev))} className="w-16 bg-transparent text-center font-bold outline-none border-b border-gray-300 focus:border-blue-500" />
                                <span className="text-gray-400 text-sm">x</span>
                                <input type="number" value={env.height} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,height:parseFloat(e.target.value)||0}:ev))} className="w-16 bg-transparent text-center font-bold outline-none border-b border-gray-300 focus:border-blue-500" />
                                <span className="text-gray-400 text-xs ml-1">m</span>
                            </div>
                        </div>

                        <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            {[
                                {id:'hasDrywall', l:'Drywall', c:'bg-blue-50 text-blue-600', cd:'dark:bg-blue-900/30 dark:text-blue-400'}, 
                                {id:'hasPainting', l:'Pintura', c:'bg-amber-50 text-amber-600', cd:'dark:bg-amber-900/30 dark:text-amber-400'},
                                {id:'hasElectrical', l:'Elétrica', c:'bg-yellow-50 text-yellow-600', cd:'dark:bg-yellow-900/30 dark:text-yellow-400'}
                            ].map(opt => (
                                <label key={opt.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${ (env as any)[opt.id] ? opt.c + ' border-transparent ' + opt.cd : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600' }`}>
                                    <input type="checkbox" checked={(env as any)[opt.id]} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,[opt.id]:e.target.checked}:ev))} className="hidden" />
                                    <span className="text-sm font-bold">{opt.l}</span>
                                </label>
                            ))}
                        </div>
                        
                        {/* Simplified Logic Display for Demo */}
                        {(env.hasDrywall || env.hasPainting || env.hasElectrical) && (
                            <div className="text-sm text-gray-500 italic">Itens e cálculos serão gerados automaticamente no resumo.</div>
                        )}
                    </div>
                ))}
                
                <button onClick={()=>setEnvs([...envs, {id:generateUUID(), name:`Ambiente ${envs.length+1}`, width:4, height:2.7, hasDrywall:true, hasPainting:false, hasElectrical:false, drywallSubType:'parede', drywallLaborPrice:0, paintingLaborPrice:0, electricalLaborPrice:0, materials:[]}])} className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-white hover:border-obra-green hover:text-obra-green transition-all font-medium flex items-center justify-center gap-2">
                   <Icons.Plus size={18} /> Adicionar Ambiente
                </button>
            </div>
            <div className="h-24"></div> 
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-4 z-40 shadow-lg">
                <button onClick={handleSave} className="bg-obra-green hover:bg-obra-dark text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">Salvar Projeto</button>
            </div>
        </div>
    </div>
  );
};


// --- SIDEBAR (Fixed Nav) ---
const Sidebar = ({ activeTab, setActiveTab, user, theme, setTheme, mobileMenuOpen, setMobileMenuOpen }: any) => (
  <>
  {/* Mobile Overlay */}
  {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
  
  <div className={`fixed inset-y-0 left-0 w-72 bg-[#f3f2f1] dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-black/20 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static`}>
     <div className="p-6">
        <AppLogo className="mb-8" />
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-white flex items-center justify-center font-bold shadow-sm">{user?.name.charAt(0)}</div>
           <div className="overflow-hidden">
               <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{user?.name}</p>
               <p className="text-xs text-gray-500 truncate">{user?.email}</p>
           </div>
        </div>
     </div>
     <div className="flex-1 px-3 space-y-1 overflow-y-auto">
        {[
          {id:'dashboard', l:'Painel Central', i:Icons.Home},
          {id:'myday', l:'Tarefas do Dia', i:Icons.Sun},
          {id:'projects', l:'Projetos', i:Icons.Briefcase},
          {id:'budgets', l:'Orçamentos', i:Icons.FileText},
          {id:'config', l:'Configurações', i:Icons.Settings},
        ].map(item => (
           <button key={item.id} onClick={()=>{setActiveTab(item.id); setMobileMenuOpen(false);}} className={`w-full flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab===item.id ? 'bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white font-bold shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/5'}`}>
              <item.i size={20} className={activeTab===item.id ? 'text-obra-green' : 'text-gray-400'} /> {item.l}
           </button>
        ))}
     </div>
     <div className="p-6">
        <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
           {theme==='light' ? <Icons.Moon size={16}/> : <Icons.Sun size={16}/>} {theme==='light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
     </div>
  </div>
  </>
);

// --- DASHBOARD LAYOUT (2x2 GRID -> 3 Columns in code below per request, but visually tiles) ---
const DashboardListView = ({ projects, user, onNavigate, onSelectItem }: any) => {
  const activeProjects = projects.filter((p: Project) => p.status === 'em_execucao' || p.status === 'aceito');
  const pendingBudgets = projects.filter((p: Project) => p.status === 'aguardando_aceite');
  const todayTasks = projects.flatMap(p => (p.tasks || []).filter(t => t.date === new Date().toISOString().split('T')[0]));
  
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Painel Central</h1>
          <p className="text-gray-500">Resumo da sua operação hoje.</p>
       </div>

       {/* Grid Layout: Using clean white tiles with soft shadows */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow cursor-pointer border-t-4 border-blue-500" onClick={()=>onNavigate('projects')}>
             <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-gray-500 uppercase">Projetos Ativos</h3><Icons.Briefcase className="text-blue-500" /></div>
             <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{activeProjects.length}</div>
             <span className="text-xs font-bold text-blue-600">Ver todos &rarr;</span>
          </div>

          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow cursor-pointer border-t-4 border-amber-500" onClick={()=>onNavigate('budgets')}>
             <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-gray-500 uppercase">Orçamentos</h3><Icons.FileText className="text-amber-500" /></div>
             <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{pendingBudgets.length}</div>
             <span className="text-xs font-bold text-amber-600">Ver pendentes &rarr;</span>
          </div>

          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow cursor-pointer border-t-4 border-purple-500" onClick={()=>onNavigate('myday')}>
             <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-gray-500 uppercase">Tarefas Hoje</h3><Icons.Clock className="text-purple-500" /></div>
             <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{todayTasks.length}</div>
             <span className="text-xs font-bold text-purple-600">Ver lista &rarr;</span>
          </div>

       </div>
       
       <div className="mt-8">
           <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Acesso Rápido</h3>
           <div className="flex gap-4 overflow-x-auto pb-4">
              <button onClick={()=>onNavigate('calculator')} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-bold text-gray-700 dark:text-white whitespace-nowrap"><Icons.Plus size={16} className="text-obra-green"/> Nova Cotação</button>
              <button onClick={()=>onNavigate('config')} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold text-gray-700 dark:text-white whitespace-nowrap"><Icons.Settings size={16} /> Configurações</button>
           </div>
       </div>
    </div>
  );
};

const MyDayListView = ({ tasks, onSelectItem }: any) => (
    <div className="p-8 max-w-4xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tarefas do Dia</h1>
        {tasks.length === 0 && <p className="text-gray-400 italic">Nenhuma tarefa para hoje.</p>}
        {tasks.map((t:any,i:number)=>(
            <div key={i} onClick={()=>onSelectItem(t,'task')} className="group flex items-center gap-4 p-4 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-purple-500">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-purple-500"></div>
                <div className="flex-1">
                    <p className="text-gray-800 dark:text-white font-medium">{t.t.text}</p>
                    <p className="text-xs text-gray-400">{t.pTitle}</p>
                </div>
            </div>
        ))}
    </div>
);

const ProjectListView = ({ projects, onSelectItem }: any) => (
    <div className="p-8 max-w-4xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Projetos</h1>
        {projects.map((p:Project)=>(
            <div key={p.id} onClick={()=>onSelectItem(p,'project')} className="group flex items-center gap-4 p-4 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                <Icons.Briefcase className="text-gray-400 group-hover:text-blue-500" />
                <div className="flex-1">
                    <p className="text-gray-800 dark:text-white font-medium">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.clientName} • {p.status}</p>
                </div>
            </div>
        ))}
    </div>
);

const DetailsPanel = ({ selectedItem, type, onClose }: any) => (
    <div className="h-full bg-white dark:bg-[#202020] p-8 border-l border-gray-100 dark:border-black/20 shadow-xl z-20 overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{type==='project'?selectedItem.title:selectedItem.t.text}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.X /></button>
        </div>
        <div className="space-y-4">
            {type==='project' ? (
                <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><span className="text-xs font-bold text-gray-500 uppercase">Cliente</span><p>{selectedItem.clientName}</p></div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><span className="text-xs font-bold text-gray-500 uppercase">Status</span><p>{selectedItem.status}</p></div>
                </>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><span className="text-xs font-bold text-gray-500 uppercase">Projeto</span><p>{selectedItem.pTitle}</p></div>
            )}
        </div>
    </div>
);

// --- APP SHELL ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'project' | 'task' | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const u = getCurrentUser(); 
    if (u) { setUser(u); setActiveTab('dashboard'); }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const projects = user ? getProjects(user.id) : [];
  
  const handleStart = () => { if (getCurrentUser()) { setUser(getCurrentUser()); setActiveTab('dashboard'); } else setShowLoginModal(true); };
  const handleLogin = (n: string, e: string) => { const u = { id: generateUUID(), name: n, email: e, isPro: false }; saveUser(u); setUser(u); setActiveTab('dashboard'); setShowLoginModal(false); };
  const handleSelectItem = (item: any, type: 'project' | 'task') => { setSelectedItem(item); setSelectedItemType(type); };

  if (activeTab === 'landing') {
      return (
          <div className="min-h-screen bg-[#faf9f8] dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              {showLoginModal && <LoginModal onClose={handleLogin} />}
              <AppLogo className="text-4xl mb-8" />
              <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Obras sem mistério.</h1>
              <p className="text-xl text-gray-500 mb-10 max-w-md mx-auto">A ferramenta definitiva para gesseiros e pintores organizarem seus projetos.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-obra-green text-white font-bold rounded-full text-xl hover:shadow-lg hover:bg-obra-dark transition-all transform hover:-translate-y-1">Entrar</button>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#faf9f8] dark:bg-[#202020] overflow-hidden font-sans text-gray-900 dark:text-white">
       {showProModal && <ProModal onClose={()=>setShowProModal(false)} />}
       
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} theme={theme} setTheme={setTheme} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
       
       <div className={`flex-1 flex flex-col min-w-0 bg-[#faf9f8] dark:bg-[#252525] relative z-0`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#202020] border-b border-gray-200 dark:border-black/20">
             <button onClick={()=>setMobileMenuOpen(true)}><Icons.Menu /></button>
             <span className="font-bold text-obra-green">DRYFLOW</span>
             <div className="w-6"></div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth relative">
              {activeTab === 'dashboard' && <DashboardListView projects={projects} user={user} onNavigate={setActiveTab} onSelectItem={handleSelectItem} />}
              {activeTab === 'myday' && <MyDayListView tasks={projects.flatMap(p=>(p.tasks||[]).filter(t=>t.date===new Date().toISOString().split('T')[0]).map(t=>({t,pid:p.id,pTitle:p.title})))} onSelectItem={handleSelectItem} />}
              {activeTab === 'projects' && <ProjectListView projects={projects} onSelectItem={handleSelectItem} />}
              {activeTab === 'budgets' && <ProjectListView projects={projects.filter(p=>p.status==='rascunho' || p.status==='aguardando_aceite')} onSelectItem={handleSelectItem} />}
              {activeTab === 'config' && <ConfigView user={user!} onUpdateUser={setUser} onShowPro={()=>setShowProModal(true)} />}
              {activeTab === 'calculator' && <CalculatorApp user={user} onShowPro={()=>setShowProModal(true)} onNavigate={setActiveTab} existingProject={editingProject} />}
          </div>
       </div>
       
       {/* Right Panel (Desktop) */}
       {activeTab !== 'calculator' && activeTab !== 'config' && selectedItem && (
           <div className={`w-[360px] flex-shrink-0 bg-white dark:bg-[#202020] hidden xl:flex flex-col border-l border-gray-100 dark:border-black/20 z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]`}>
               <DetailsPanel selectedItem={selectedItem} type={selectedItemType} onClose={()=>setSelectedItem(null)} />
           </div>
       )}
    </div>
  );
}
