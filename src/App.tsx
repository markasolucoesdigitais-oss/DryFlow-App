import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  getCurrentUser, 
  saveUser, 
  getProjects, 
  saveSingleProject
} from './services/storage';
import { Project, User, Environment, ServiceCategory } from './types';

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

const generateUUID = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

const AppLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img src="/logo.png" alt="DRYFLOW" className="h-8 w-auto object-contain opacity-90" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
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
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-white/40 dark:border-slate-700 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Bem-vindo</h2>
        <p className="text-slate-500 mb-8 font-light">Cadastre-se para começar a calcular.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 border-none bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green transition-all placeholder-gray-400" placeholder="Seu Nome" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border-none bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-obra-green transition-all placeholder-gray-400" placeholder="Seu E-mail" />
          <button type="submit" className="w-full bg-obra-green hover:bg-obra-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-transform active:scale-95">Acessar Calculadora</button>
        </form>
      </div>
    </div>
  );
};

const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">✕</button>
      <div className="text-center pt-4">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><span className="text-4xl">👑</span></div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Seja Profissional</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg font-light leading-relaxed">Desbloqueie PDF, histórico ilimitado e gestão completa por apenas <span className="font-bold text-obra-green">R$ {PRICE_PRO}</span>.</p>
        <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-500/30 transition-transform hover:scale-[1.02]">QUERO SER PRO</button>
      </div>
    </div>
  );
};

// --- VIEWS ---

interface ConfigViewProps {
  user: User;
  onUpdateUser: (u: User) => void;
  onShowPro: () => void;
}
const ConfigView = ({ user, onUpdateUser, onShowPro }: ConfigViewProps) => {
  const [formData, setFormData] = useState(user);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); saveUser(formData); onUpdateUser(formData); alert('Dados salvos!'); };
  return (
    <div className="p-8 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Configurações</h1>
      <div className="bg-white dark:bg-[#2b2b2b] rounded-xl shadow-sm border border-transparent dark:border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#202020] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Empresa</label><input value={formData.companyName||''} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#202020] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Cidade</label><input value={formData.city||''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#202020] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
           </div>
           <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-obra-green text-white font-bold py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-all">Salvar</button>
           </div>
        </form>
      </div>
    </div>
  );
};

interface CalculatorAppProps {
  user: User | null;
  onShowPro: () => void;
  onNavigate: (tab: string) => void;
  existingProject?: Project | null;
}
const CalculatorApp = ({ user, onShowPro, onNavigate, existingProject }: CalculatorAppProps) => {
  const [clientName, setClientName] = useState(existingProject?.clientName || '');
  const [title, setTitle] = useState(existingProject?.title || '');
  const [status, setStatus] = useState<Project['status']>(existingProject?.status || 'rascunho');
  const [envs, setEnvs] = useState<Environment[]>(existingProject?.environments || [{ id: generateUUID(), name: 'Ambiente 1', width: 4, height: 2.7, hasDrywall: true, hasPainting: false, hasElectrical: false, drywallSubType: 'parede', drywallLaborPrice: 0, paintingLaborPrice: 0, electricalLaborPrice: 0, materials: [] }]);
  
  const handleSave = () => { if (!user?.isPro) { onShowPro(); return; } saveSingleProject(user.id, { id: existingProject?.id || generateUUID(), clientId: '', clientName: clientName || 'Novo Cliente', title: title || 'Novo Orçamento', date: new Date().toISOString(), status, environments: envs, totalMaterials: 0, totalLabor: 0, grandTotal: 0 }); alert('Salvo!'); onNavigate('dashboard'); };

  return (
    <div className="absolute inset-0 bg-[#faf9f8] dark:bg-[#202020] z-50 overflow-y-auto animate-fade-in flex flex-col items-center pt-8">
        <div className="w-full max-w-5xl px-6 mb-4 flex items-center justify-between">
             <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"><Icons.ArrowLeft size={18} /> Voltar</button>
             <h1 className="text-xl font-bold text-gray-800 dark:text-white">Calculadora</h1>
             <div className="w-20"></div>
        </div>

        <div className="w-full max-w-5xl bg-white dark:bg-[#2b2b2b] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[80vh] flex flex-col">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">Cliente</label>
                        <input value={clientName} onChange={e=>setClientName(e.target.value)} className="w-full text-2xl font-bold border-b border-transparent focus:border-obra-green outline-none pb-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-300 transition-colors" placeholder="Nome do Cliente" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">Projeto</label>
                        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full text-2xl font-bold border-b border-transparent focus:border-obra-green outline-none pb-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-300 transition-colors" placeholder="Nome do Projeto" />
                    </div>
                 </div>
            </div>

            <div className="p-8 space-y-8 flex-1">
                {envs.map((env, i) => (
                    <div key={env.id} className="relative group">
                        <div className="flex items-end gap-6 mb-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Ambiente {i+1}</label>
                                <input value={env.name} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,name:e.target.value}:ev))} className="text-xl font-semibold bg-transparent outline-none text-gray-800 dark:text-white w-full border-b border-transparent hover:border-gray-200 focus:border-blue-500 transition-colors" />
                            </div>
                            <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                                <input type="number" value={env.width} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,width:parseFloat(e.target.value)||0}:ev))} className="w-16 bg-transparent text-center font-bold outline-none text-gray-800 dark:text-white" />
                                <span className="text-gray-400 text-sm">x</span>
                                <input type="number" value={env.height} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,height:parseFloat(e.target.value)||0}:ev))} className="w-16 bg-transparent text-center font-bold outline-none text-gray-800 dark:text-white" />
                                <span className="text-gray-400 text-xs ml-1">m</span>
                            </div>
                            <button onClick={() => { if(envs.length>1) setEnvs(envs.filter(e=>e.id!==env.id)) }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Icons.Trash /></button>
                        </div>

                        <div className="flex gap-3 mb-6">
                            {[
                                {id:'hasDrywall', l:'Drywall', c:'bg-blue-50 text-blue-600', cd:'dark:bg-blue-900/30 dark:text-blue-400'}, 
                                {id:'hasPainting', l:'Pintura', c:'bg-amber-50 text-amber-600', cd:'dark:bg-amber-900/30 dark:text-amber-400'},
                                {id:'hasElectrical', l:'Elétrica', c:'bg-yellow-50 text-yellow-600', cd:'dark:bg-yellow-900/30 dark:text-yellow-400'}
                            ].map(opt => (
                                <label key={opt.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border ${ (env as any)[opt.id] ? opt.c + ' border-transparent ' + opt.cd : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700' }`}>
                                    <input type="checkbox" checked={(env as any)[opt.id]} onChange={e=>setEnvs(envs.map(ev=>ev.id===env.id?{...ev,[opt.id]:e.target.checked}:ev))} className="hidden" />
                                    <span className="text-sm font-bold">{opt.l}</span>
                                </label>
                            ))}
                        </div>
                        <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>
                    </div>
                ))}
                
                <button onClick={()=>setEnvs([...envs, {id:generateUUID(), name:`Ambiente ${envs.length+1}`, width:4, height:2.7, hasDrywall:true, hasPainting:false, hasElectrical:false, drywallSubType:'parede', drywallLaborPrice:0, paintingLaborPrice:0, electricalLaborPrice:0, materials:[]}])} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-obra-green hover:text-obra-green transition-all font-medium flex items-center justify-center gap-2">
                   <Icons.Plus size={18} /> Adicionar Ambiente
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-[#252525] p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4 rounded-b-xl">
                <button onClick={handleSave} className="bg-obra-green hover:bg-obra-dark text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">Salvar Projeto</button>
            </div>
        </div>
        <div className="h-12"></div>
    </div>
  );
};


// --- SIDEBAR (Fixed Nav) ---
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}
const Sidebar = ({ activeTab, setActiveTab, user, theme, setTheme, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) => (
  <>
  {/* Mobile Overlay */}
  {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
  
  <div className={`fixed inset-y-0 left-0 w-72 bg-[#f3f2f1] dark:bg-[#1f1f1f] flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-none border-r border-transparent dark:border-black/30`}>
     <div className="p-6">
        <AppLogo className="mb-8" />
        <div className="flex items-center gap-3 mb-6 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
           <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-white flex items-center justify-center font-bold shadow-sm border border-gray-100 dark:border-gray-600">{user?.name.charAt(0)}</div>
           <div className="overflow-hidden">
               <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{user?.name}</p>
           </div>
        </div>
        
        <div className="relative mb-6">
            <Icons.Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Pesquisar" className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2b2b2b] rounded-md text-sm outline-none border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 dark:text-white" />
        </div>
     </div>
     
     <div className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {[
          {id:'dashboard', l:'Painel Central', i:Icons.Home},
          {id:'myday', l:'Meu Dia', i:Icons.Sun},
          {id:'projects', l:'Projetos', i:Icons.Briefcase},
          {id:'budgets', l:'Orçamentos', i:Icons.FileText},
          {id:'config', l:'Configurações', i:Icons.Settings},
        ].map(item => (
           <button key={item.id} onClick={()=>{setActiveTab(item.id); setMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab===item.id ? 'bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white font-semibold shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/5'}`}>
              <item.i size={18} className={activeTab===item.id ? 'text-gray-800 dark:text-white' : 'text-gray-400'} /> 
              {item.l}
           </button>
        ))}
     </div>
     <div className="p-6">
        <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
           {theme==='light' ? <Icons.Moon size={16}/> : <Icons.Sun size={16}/>} {theme==='light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
     </div>
  </div>
  </>
);

// --- CENTER PANEL (Lists) ---
interface DashboardListViewProps {
  projects: Project[];
  user: User | null;
  onNavigate: (tab: string) => void;
  onSelectItem: (item: any, type: 'project' | 'task') => void;
}
const DashboardListView = ({ projects, user, onNavigate, onSelectItem }: DashboardListViewProps) => {
  const activeProjects = projects.filter((p: Project) => p.status === 'em_execucao' || p.status === 'aceito');
  const pendingBudgets = projects.filter((p: Project) => p.status === 'aguardando_aceite');
  const todayTasks = projects.flatMap(p => (p.tasks || []).filter(t => t.date === new Date().toISOString().split('T')[0]));
  
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
       <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Painel Central</h1>
          <p className="text-gray-500 text-sm">Resumo da sua operação hoje.</p>
       </div>

       {/* 3-Column Grid of Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          <div className="bg-white dark:bg-[#2b2b2b] p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer group" onClick={()=>onNavigate('projects')}>
             <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projetos</h3><Icons.Briefcase className="text-blue-500 opacity-80 group-hover:scale-110 transition-transform" size={18}/></div>
             <div className="text-3xl font-bold text-gray-800 dark:text-white">{activeProjects.length}</div>
          </div>

          <div className="bg-white dark:bg-[#2b2b2b] p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer group" onClick={()=>onNavigate('budgets')}>
             <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orçamentos</h3><Icons.FileText className="text-amber-500 opacity-80 group-hover:scale-110 transition-transform" size={18} /></div>
             <div className="text-3xl font-bold text-gray-800 dark:text-white">{pendingBudgets.length}</div>
          </div>

          <div className="bg-white dark:bg-[#2b2b2b] p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer group" onClick={()=>onNavigate('myday')}>
             <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarefas</h3><Icons.Clock className="text-purple-500 opacity-80 group-hover:scale-110 transition-transform" size={18} /></div>
             <div className="text-3xl font-bold text-gray-800 dark:text-white">{todayTasks.length}</div>
          </div>
       </div>
       
       <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 px-1">Atalhos</h3>
       <div className="flex gap-3 overflow-x-auto pb-4">
          <button onClick={()=>onNavigate('calculator')} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 text-sm font-medium text-gray-700 dark:text-white whitespace-nowrap transition-colors"><Icons.Plus size={16} className="text-obra-green"/> Nova Cotação</button>
          <button onClick={()=>onNavigate('config')} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 text-sm font-medium text-gray-700 dark:text-white whitespace-nowrap transition-colors"><Icons.Settings size={16} className="text-gray-400" /> Configurações</button>
       </div>
    </div>
  );
};

interface MyDayListViewProps {
  tasks: any[];
  onSelectItem: (item: any, type: 'project' | 'task') => void;
}
const MyDayListView = ({ tasks, onSelectItem }: MyDayListViewProps) => (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meu Dia</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        
        {/* Add Task Input (Visual) */}
        <div className="mb-6 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-sm flex items-center p-3 gap-3 border border-transparent focus-within:border-blue-400 transition-colors">
            <Icons.Plus className="text-blue-500" />
            <input type="text" placeholder="Adicionar uma tarefa" className="bg-transparent outline-none w-full text-sm text-gray-800 dark:text-white placeholder-gray-400" />
        </div>

        <div className="space-y-1 overflow-y-auto flex-1 pb-10">
            {tasks.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Nenhuma tarefa pendente para hoje.</div>}
            {tasks.map((t:any,i:number)=>(
                <div key={i} onClick={()=>onSelectItem(t,'task')} className="group flex items-center gap-3 p-3 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                    <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-purple-500 flex items-center justify-center"></div>
                    <div className="flex-1">
                        <p className="text-gray-800 dark:text-white text-sm font-medium">{t.t.text}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Icons.Briefcase size={10}/> {t.pTitle}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface ProjectListViewProps {
  projects: Project[];
  onSelectItem: (item: any, type: 'project' | 'task') => void;
}
const ProjectListView = ({ projects, onSelectItem }: ProjectListViewProps) => (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Projetos</h1>
        <div className="space-y-2 overflow-y-auto flex-1 pb-10">
            {projects.map((p:Project)=>(
                <div key={p.id} onClick={()=>onSelectItem(p,'project')} className="group flex items-center gap-4 p-4 bg-white dark:bg-[#2b2b2b] rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                    <Icons.Briefcase className="text-gray-400 group-hover:text-blue-500" />
                    <div className="flex-1">
                        <p className="text-gray-800 dark:text-white font-medium">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.clientName} • {p.status.replace('_',' ')}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- RIGHT PANEL (Details) ---
interface DetailsPanelProps {
  selectedItem: any;
  type: 'project' | 'task' | null;
  onClose: () => void;
}
const DetailsPanel = ({ selectedItem, type, onClose }: DetailsPanelProps) => (
    <div className="h-full bg-white dark:bg-[#252525] p-6 border-l border-gray-100 dark:border-black/20 shadow-xl z-20 overflow-y-auto flex flex-col">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex-1 leading-snug">{type==='project'?selectedItem.title:selectedItem.t.text}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.ChevronRight /></button>
        </div>
        
        <div className="space-y-6">
            {type==='project' ? (
                <>
                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Cliente</label><p className="text-gray-800 dark:text-white">{selectedItem.clientName}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label><span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded text-gray-600 dark:text-gray-300 uppercase">{selectedItem.status}</span></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Data</label><p className="text-gray-800 dark:text-white text-sm">{new Date(selectedItem.date).toLocaleDateString()}</p></div>
                </>
            ) : (
                 <>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#2b2b2b] rounded-lg">
                        <Icons.Briefcase size={16} className="text-gray-400"/>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.pTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#2b2b2b] rounded-lg">
                        <Icons.Calendar size={16} className="text-gray-400"/>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Hoje</span>
                    </div>
                 </>
            )}
        </div>
        
        <div className="mt-auto pt-6 text-center text-xs text-gray-300 dark:text-gray-600">
            Criado em {new Date().toLocaleDateString()}
        </div>
    </div>
);

// --- APP SHELL ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
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
          <div className="min-h-screen bg-[#faf9f8] dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              {showLoginModal && <LoginModal onClose={handleLogin} />}
              <AppLogo className="text-5xl mb-10 scale-150" />
              <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Obras sem mistério.</h1>
              <p className="text-2xl text-gray-500 mb-12 max-w-lg mx-auto font-light leading-relaxed">A ferramenta definitiva para gesseiros e pintores organizarem seus projetos.</p>
              <button onClick={handleStart} className="px-12 py-5 bg-obra-green text-white font-bold rounded-full text-xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-xl hover:bg-obra-dark transition-all transform hover:-translate-y-1">Começar Agora</button>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#faf9f8] dark:bg-[#202020] overflow-hidden font-sans text-gray-900 dark:text-white">
       {showProModal && <ProModal onClose={()=>setShowProModal(false)} />}
       
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} theme={theme} setTheme={setTheme} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
       
       <div className={`flex-1 flex flex-col min-w-0 bg-[#faf9f8] dark:bg-[#252525] relative z-0 transition-all`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#202020] border-b border-gray-200 dark:border-black/20">
             <button onClick={()=>setMobileMenuOpen(true)}><Icons.Menu /></button>
             <span className="font-bold text-obra-green">DRYFLOW</span>
             <div className="w-6"></div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth relative">
              {activeTab === 'dashboard' && <DashboardListView projects={projects} user={user} onNavigate={setActiveTab} onSelectItem={handleSelectItem} />}
              {activeTab === 'myday' && <MyDayListView tasks={projects.flatMap(p=>(p.tasks || []).filter(t=>t.date===new Date().toISOString().split('T')[0]).map(t=>({t,pid:p.id,pTitle:p.title})))} onSelectItem={handleSelectItem} />}
              {activeTab === 'projects' && <ProjectListView projects={projects} onSelectItem={handleSelectItem} />}
              {activeTab === 'budgets' && <ProjectListView projects={projects.filter(p=>p.status==='rascunho' || p.status==='aguardando_aceite')} onSelectItem={handleSelectItem} />}
              {activeTab === 'config' && user && <ConfigView user={user} onUpdateUser={setUser} onShowPro={()=>setShowProModal(true)} />}
              {activeTab === 'calculator' && <CalculatorApp user={user} onShowPro={()=>setShowProModal(true)} onNavigate={setActiveTab} existingProject={editingProject} />}
          </div>
       </div>
       
       {/* Right Panel (Desktop) */}
       {activeTab !== 'calculator' && activeTab !== 'config' && activeTab !== 'dashboard' && selectedItem && (
           <div className={`w-[360px] flex-shrink-0 bg-white dark:bg-[#202020] hidden xl:flex flex-col border-l border-gray-100 dark:border-black/20 z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]`}>
               <DetailsPanel selectedItem={selectedItem} type={selectedItemType} onClose={()=>setSelectedItem(null)} />
           </div>
       )}
    </div>
  );
}