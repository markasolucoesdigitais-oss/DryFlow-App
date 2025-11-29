
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
    <img src="/logo.png" alt="DRYFLOW" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
    <span className="hidden text-xl font-extrabold text-obra-green tracking-tight">DRYFLOW</span>
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
    <div className="p-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Configurações</h1>
      {showQR && <DigitalCardModal user={user} onClose={() => setShowQR(false)} />}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 mt-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-obra-green" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Empresa</label><input value={formData.companyName||''} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-4 mt-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Cidade</label><input value={formData.city||''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 mt-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" /></div>
         </div>
         <button type="submit" className="bg-obra-green text-white font-bold py-3 px-6 rounded-xl">Salvar</button>
         <button type="button" onClick={() => { if(user.isPro) setShowQR(true); else onShowPro(); }} className="ml-4 text-slate-500 font-bold hover:text-slate-900">Cartão Digital</button>
      </form>
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
    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-50 overflow-y-auto p-6 animate-fade-in">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => onNavigate('dashboard')} className="p-2 bg-slate-100 rounded-full"><Icons.ArrowLeft /></button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calculadora</h1>
            </div>
            <div className="grid gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex gap-4 mb-4">
                        <input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Cliente" className="flex-1 p-3 rounded-xl border-none" />
                        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="flex-1 p-3 rounded-xl border-none" />
                    </div>
                    {envs.map((env, i) => (
                        <div key={env.id} className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                            <div className="flex justify-between font-bold mb-2"><span>{env.name}</span><span>{(env.width*env.height).toFixed(2)}m²</span></div>
                            <div className="flex gap-2 text-sm text-slate-500">
                                <label><input type="checkbox" checked={env.hasDrywall} onChange={()=>{}} /> Drywall</label>
                                <label><input type="checkbox" checked={env.hasPainting} onChange={()=>{}} /> Pintura</label>
                            </div>
                        </div>
                    ))}
                    <button onClick={()=>setEnvs([...envs, {id:generateUUID(), name:`Ambiente ${envs.length+1}`, width:4, height:2.7, hasDrywall:true, hasPainting:false, hasElectrical:false, drywallSubType:'parede', drywallLaborPrice:0, paintingLaborPrice:0, electricalLaborPrice:0, materials:[]}])} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl font-bold text-slate-400">Adicionar Ambiente</button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-slate-200 flex justify-end gap-4">
                <button onClick={handleSave} className="bg-obra-green text-white font-bold py-3 px-8 rounded-xl">Salvar Projeto</button>
            </div>
        </div>
    </div>
  );
};


// --- SIDEBAR (Fixed Nav) ---
const Sidebar = ({ activeTab, setActiveTab, user, theme, setTheme }: any) => (
  <div className="w-[280px] bg-[#f3f4f6] dark:bg-[#202020] border-r border-slate-200 dark:border-black/20 flex flex-col hidden md:flex flex-shrink-0 h-full">
     <div className="p-5">
        <AppLogo className="mb-6" />
        <div className="flex items-center gap-3 mb-6 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors">
           <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs">{user?.name.charAt(0)}</div>
           <div className="overflow-hidden"><p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user?.name}</p></div>
        </div>
     </div>
     <div className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {[
          {id:'dashboard', l:'Painel Central', i:Icons.Home},
          {id:'myday', l:'Tarefas do Dia', i:Icons.Sun},
          {id:'projects', l:'Projetos', i:Icons.Briefcase},
          {id:'budgets', l:'Orçamentos', i:Icons.FileText},
          {id:'config', l:'Configurações', i:Icons.Settings},
        ].map(item => (
           <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeTab===item.id ? 'bg-white dark:bg-[#2b2b2b] text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}>
              <item.i size={18} className={activeTab===item.id ? 'text-obra-green' : 'text-slate-400'} /> {item.l}
           </button>
        ))}
     </div>
     <div className="p-4 border-t border-slate-200 dark:border-black/20">
        <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700">
           {theme==='light' ? <Icons.Moon size={14}/> : <Icons.Sun size={14}/>} {theme==='light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
     </div>
  </div>
);

// --- NEW DASHBOARD LAYOUT (2x2 GRID) ---
const DashboardListView = ({ projects, user, onNavigate, onSelectItem }: any) => {
  const activeProjects = projects.filter((p: Project) => p.status === 'em_execucao' || p.status === 'aceito');
  const pendingBudgets = projects.filter((p: Project) => p.status === 'aguardando_aceite');
  const todayTasks = projects.flatMap(p => (p.tasks || []).filter(t => t.date === new Date().toISOString().split('T')[0]));
  
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
       {/* Header */}
       <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Painel Central</h1>
          <p className="text-slate-500">Olá, {user.name.split(' ')[0]}. Resumo da sua operação hoje.</p>
       </div>

       {/* 2x2 GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Projetos Ativos */}
          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
             <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4"><Icons.Briefcase size={24}/></div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Projetos Ativos</h3>
             <div className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">{activeProjects.length}</div>
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={()=>onNavigate('projects')} className="text-sm font-bold text-blue-600 hover:underline">Ver projetos &rarr;</button>
             </div>
          </div>

          {/* Card 2: Orçamentos Pendentes */}
          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
             <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mb-4"><Icons.FileText size={24}/></div>
             <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Orçamentos Pendentes</h3>
                    <div className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">{pendingBudgets.length}</div>
                 </div>
                 <div className="text-right space-y-2 mt-1">
                     {pendingBudgets.slice(0,3).map((p: Project) => (
                         <div key={p.id} className="text-xs text-slate-500">{p.clientName} <span className="text-slate-300">•</span> {new Date(p.date).toLocaleDateString().slice(0,5)}</div>
                     ))}
                 </div>
             </div>
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={()=>onNavigate('budgets')} className="text-sm font-bold text-amber-600 hover:underline">Ver orçamentos &rarr;</button>
             </div>
          </div>

          {/* Card 3: Meu Dia (Tarefas) */}
          <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
             <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4"><Icons.Clock size={24}/></div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Tarefas de Hoje</h3>
             <div className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">{todayTasks.length}</div>
             <p className="text-sm text-slate-400 mt-1">Itens agendados nos checklists.</p>
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={()=>onNavigate('myday')} className="text-sm font-bold text-purple-600 hover:underline">Ver lista de tarefas &rarr;</button>
             </div>
          </div>

          {/* Card 4: Atalhos Rápidos */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col justify-center">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Acesso Rápido</h3>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>onNavigate('calculator')} className="bg-white dark:bg-[#2b2b2b] hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center transition-colors shadow-sm">
                   <div className="text-obra-green font-bold text-sm">Nova Cotação</div>
                </button>
                <button onClick={()=>onNavigate('projects')} className="bg-white dark:bg-[#2b2b2b] hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center transition-colors shadow-sm">
                   <div className="text-blue-600 font-bold text-sm">Novo Projeto</div>
                </button>
                <button onClick={()=>onNavigate('config')} className="bg-white dark:bg-[#2b2b2b] hover:bg-slate-100 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center transition-colors shadow-sm">
                   <div className="text-slate-600 dark:text-slate-300 font-bold text-sm">Configurações</div>
                </button>
                <button className="bg-white dark:bg-[#2b2b2b] hover:bg-slate-100 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center transition-colors shadow-sm cursor-not-allowed opacity-60">
                   <div className="text-slate-400 font-bold text-sm">Clientes</div>
                </button>
             </div>
          </div>

       </div>
    </div>
  );
};

// ... (MyDayListView, ProjectListView, DetailsPanel remain the same structure logic but used via nav) ...
// Re-declaring minimal versions to ensure compilation if not replaced above, but intent is replacement.
const MyDayListView = ({ tasks, onSelectItem }: any) => (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tarefas do Dia</h1>
        {tasks.map((t:any,i:number)=>(<div key={i} onClick={()=>onSelectItem(t,'task')} className="p-4 bg-white dark:bg-[#2b2b2b] rounded shadow-sm border border-slate-100 cursor-pointer">{t.t.text}</div>))}
    </div>
);
const ProjectListView = ({ projects, onSelectItem }: any) => (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projetos</h1>
        {projects.map((p:Project)=>(<div key={p.id} onClick={()=>onSelectItem(p,'project')} className="p-4 bg-white dark:bg-[#2b2b2b] rounded shadow-sm border border-slate-100 cursor-pointer">{p.title}</div>))}
    </div>
);
const DetailsPanel = ({ selectedItem, type, onClose }: any) => (
    <div className="h-full bg-white dark:bg-[#202020] p-6 border-l border-slate-100"><button onClick={onClose}><Icons.X/></button><h2 className="text-xl font-bold mt-4">{type==='project'?selectedItem.title:selectedItem.t.text}</h2></div>
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
          <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              {showLoginModal && <LoginModal onClose={handleLogin} />}
              <AppLogo className="text-4xl mb-8" />
              <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Obras sem mistério.</h1>
              <button onClick={handleStart} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl text-xl hover:scale-105 transition-transform">Entrar</button>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#202020] overflow-hidden font-sans text-slate-900 dark:text-white">
       {showProModal && <ProModal onClose={()=>setShowProModal(false)} />}
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} theme={theme} setTheme={setTheme} />
       <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-[#252525] border-r border-slate-200 dark:border-black/20 relative z-0`}>
          <div className="flex-1 overflow-y-auto scroll-smooth">
              {activeTab === 'dashboard' && <DashboardListView projects={projects} user={user} onNavigate={setActiveTab} onSelectItem={handleSelectItem} />}
              {activeTab === 'myday' && <MyDayListView tasks={projects.flatMap(p=>(p.tasks||[]).filter(t=>t.date===new Date().toISOString().split('T')[0]).map(t=>({t,pid:p.id,pTitle:p.title})))} onSelectItem={handleSelectItem} />}
              {activeTab === 'projects' && <ProjectListView projects={projects} onSelectItem={handleSelectItem} />}
              {activeTab === 'budgets' && <ProjectListView projects={projects.filter(p=>p.status==='rascunho' || p.status==='aguardando_aceite')} onSelectItem={handleSelectItem} />}
              {activeTab === 'config' && <ConfigView user={user!} onUpdateUser={setUser} onShowPro={()=>setShowProModal(true)} />}
          </div>
          {activeTab === 'calculator' && <CalculatorApp user={user} onShowPro={()=>setShowProModal(true)} onNavigate={setActiveTab} existingProject={editingProject} />}
       </div>
       {activeTab !== 'calculator' && activeTab !== 'config' && selectedItem && (
           <div className={`w-[360px] flex-shrink-0 bg-white dark:bg-[#202020] hidden xl:flex flex-col border-l border-slate-100 dark:border-black/20 z-10`}>
               <DetailsPanel selectedItem={selectedItem} type={selectedItemType} onClose={()=>setSelectedItem(null)} />
           </div>
       )}
    </div>
  );
}
