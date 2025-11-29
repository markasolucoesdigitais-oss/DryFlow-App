import React, { useState, useEffect, useRef } from 'react';
import { generateProjectAdvice } from './services/gemini';
import { 
  getCurrentUser, 
  saveUser, 
  getProjects, 
  saveSingleProject, 
  deleteAccount
} from './services/storage';
import { Project, User, Environment, MaterialItem, Client, ServiceCategory } from './types';

// --- ICONS ---
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

const Icons = {
  Lock: ({ size = 14, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Check: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>,
  User: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Sun: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Trash: ({ size = 16, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Download: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Plus: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Briefcase: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Send: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  QrCode: ({ size = 20, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Edit: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Settings: ({ size = 18, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
};

const PRICE_PRO = "49,90";

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Começar Gratuitamente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Seu Nome" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Seu E-mail" />
          <button type="submit" className="w-full bg-obra-green hover:bg-obra-dark text-white font-bold py-3 rounded-xl">Acessar Calculadora</button>
        </form>
      </div>
    </div>
  );
};

const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-200 dark:border-gray-700">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
      <div className="text-center">
        <div className="bg-alert-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">👑</span></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seja Profissional</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Liberdade total para seu negócio por apenas <span className="font-bold text-obra-green">R$ {PRICE_PRO}</span> (único).</p>
        <div className="grid gap-3 text-left mb-6">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Salvar orçamentos ilimitados</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Gerar PDF de Proposta Comercial</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Listas de Material por Categoria</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Gestão de Projetos e Clientes</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Cartão Digital QR Code</span></div>
        </div>
        <button className="w-full bg-alert-orange hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30">QUERO SER PRO</button>
      </div>
    </div>
  </div>
);

const DigitalCardModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  // Generate vCard data
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seu Cartão Digital</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Peça para seu cliente escanear para salvar seu contato.</p>
          
          <div className="bg-white p-4 rounded-xl shadow-inner inline-block border border-gray-100 mb-4">
             <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
             <p className="font-bold">{user.name}</p>
             <p>{user.phone}</p>
             <p className="text-xs text-gray-400">{user.email}</p>
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
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Icons.Settings /> Configurações
      </h1>
      
      {showQR && <DigitalCardModal user={user} onClose={() => setShowQR(false)} />}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
           <h2 className="font-bold text-lg text-gray-900 dark:text-white">Perfil Profissional</h2>
           <p className="text-sm text-gray-500">Esses dados aparecerão nos seus orçamentos e cartão digital.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none" 
              />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''} 
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  placeholder="Ex: Silva Construções"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade / UF</label>
                <input 
                  type="text" 
                  value={formData.city || ''} 
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none" 
                />
             </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
              <input 
                type="tel" 
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 90000-0000"
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none" 
              />
           </div>
           
           <div className="pt-4 flex flex-col md:flex-row gap-3">
              <button type="submit" className="flex-1 bg-obra-green text-white font-bold py-3 rounded-xl hover:bg-obra-dark transition-colors">
                 Salvar Dados
              </button>
              <button type="button" onClick={() => { if(user.isPro) setShowQR(true); else onShowPro(); }} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                 {user.isPro ? <Icons.QrCode /> : <Icons.Lock size={14} />} Gerar Cartão Digital
              </button>
           </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
         <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Conta</h2>
         <div className="flex items-center justify-between">
            <div>
               <p className="text-gray-600 dark:text-gray-400">Plano Atual</p>
               <p className={`font-bold ${user.isPro ? 'text-alert-orange' : 'text-gray-500'}`}>{user.isPro ? 'PROFISSIONAL (Vitalício)' : 'Gratuito'}</p>
            </div>
            {!user.isPro && <button onClick={onShowPro} className="text-sm font-bold text-alert-orange hover:underline">Fazer Upgrade</button>}
         </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CALCULATOR APP (THE CORE) ---
const CalculatorApp = ({ user, onShowPro, onNavigate, existingProject }: { user: User | null, onShowPro: () => void, onNavigate: (tab: string) => void, existingProject?: Project | null }) => {
  const [clientName, setClientName] = useState(existingProject?.clientName || '');
  const [title, setTitle] = useState(existingProject?.title || '');
  const [status, setStatus] = useState<Project['status']>(existingProject?.status || 'rascunho');
  const [startDate, setStartDate] = useState(existingProject?.startDate || '');
  
  // Environments State
  const [envs, setEnvs] = useState<Environment[]>(existingProject?.environments || [{
    id: crypto.randomUUID(),
    name: 'Ambiente 1',
    width: 4, height: 2.7,
    hasDrywall: true, hasPainting: false, hasElectrical: false,
    drywallSubType: 'parede',
    drywallLaborPrice: 0, paintingLaborPrice: 0, electricalLaborPrice: 0,
    materials: []
  }]);

  const [showSummary, setShowSummary] = useState(false);

  // Auto-calculate base materials when dimensions change
  useEffect(() => {
    setEnvs(prevEnvs => prevEnvs.map(env => {
      const area = env.width * env.height;
      let newMaterials = env.materials.filter(m => !m.isAutoCalculated); // Keep manual items

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

      // Electrical is purely manual selection, no formulas
      return { ...env, materials: newMaterials };
    }));
  }, [envs.map(e => `${e.width}-${e.height}-${e.hasDrywall}-${e.drywallSubType}-${e.hasPainting}`).join('|')]);

  const addEnv = () => {
    setEnvs([...envs, {
      id: crypto.randomUUID(),
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
        materials: [...env.materials, { id: crypto.randomUUID(), category, name, quantity: 1, unit: 'un' }]
      };
    }));
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

  // --- ACTIONS ---
  const handleSave = () => {
    if (!user?.isPro) { onShowPro(); return; }
    const project: Project = {
      id: existingProject?.id || crypto.randomUUID(),
      clientId: '', clientName: clientName || 'Novo Cliente',
      title: title || 'Novo Orçamento',
      date: new Date().toISOString(),
      status, startDate,
      environments: envs,
      totalMaterials: 0, totalLabor: 0, grandTotal: 0 // Calculated dynamically usually
    };
    saveSingleProject(user.id, project);
    alert('Orçamento salvo com sucesso!');
    onNavigate('projects');
  };

  const handlePrint = (type: 'proposal' | 'materials') => {
    if (!user?.isPro) { onShowPro(); return; }
    // In a real app, we would route to a PDF generation view.
    // Here we simulate by triggering print and letting CSS hide/show sections.
    window.print(); 
  };

  if (showSummary) {
    // --- SUMMARY & PROPOSAL VIEW ---
    const totalDrywallLabor = envs.reduce((acc, e) => acc + (e.hasDrywall ? e.drywallLaborPrice : 0), 0);
    const totalPaintingLabor = envs.reduce((acc, e) => acc + (e.hasPainting ? e.paintingLaborPrice : 0), 0);
    const totalElectricalLabor = envs.reduce((acc, e) => acc + (e.hasElectrical ? e.electricalLaborPrice : 0), 0);
    
    // Group materials by category
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
        <div className="flex items-center gap-3 mb-6 no-print">
          <button onClick={() => setShowSummary(false)} className="flex items-center gap-1 text-gray-500 hover:text-obra-green">
            <Icons.ArrowLeft /> Voltar para Edição
          </button>
          <h1 className="text-xl font-bold ml-auto text-gray-900 dark:text-white">Resumo e Proposta</h1>
        </div>

        {/* --- PROPOSAL DOCUMENT (VISIBLE ON PRINT) --- */}
        <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:w-full">
           <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900">{user?.companyName || user?.name || 'Profissional'}</h1>
                 <p className="text-gray-500">{user?.city} • {user?.phone}</p>
                 <p className="text-gray-500">{user?.email}</p>
              </div>
              <div className="text-right">
                 <div className="text-sm text-gray-400">Proposta para</div>
                 <h2 className="text-xl font-bold text-gray-800">{clientName || 'Cliente'}</h2>
                 <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
           </div>

           {/* Environments Summary */}
           <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Ambientes e Serviços</h3>
              {envs.map(env => (
                <div key={env.id} className="flex justify-between py-2 border-b border-gray-100">
                   <span className="font-medium text-gray-800">{env.name} ({env.width}x{env.height}m)</span>
                   <div className="text-sm text-gray-500 flex gap-2">
                     {env.hasDrywall && <span className="bg-gray-100 px-2 rounded">Drywall</span>}
                     {env.hasPainting && <span className="bg-gray-100 px-2 rounded">Pintura</span>}
                     {env.hasElectrical && <span className="bg-gray-100 px-2 rounded">Elétrica</span>}
                   </div>
                </div>
              ))}
           </div>

           {/* Totals Table */}
           <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Investimento</h3>
              <table className="w-full text-left">
                 <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr><th className="p-3">Categoria</th><th className="p-3 text-right">Mão de Obra</th></tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {drywallMats.length > 0 && <tr><td className="p-3">Drywall (Forro/Parede)</td><td className="p-3 text-right font-bold">R$ {totalDrywallLabor.toFixed(2)}</td></tr>}
                    {paintingMats.length > 0 && <tr><td className="p-3">Pintura e Acabamento</td><td className="p-3 text-right font-bold">R$ {totalPaintingLabor.toFixed(2)}</td></tr>}
                    {electricalMats.length > 0 && <tr><td className="p-3">Instalações Elétricas</td><td className="p-3 text-right font-bold">R$ {totalElectricalLabor.toFixed(2)}</td></tr>}
                    <tr className="bg-gray-50 text-lg">
                       <td className="p-3 font-bold">TOTAL MÃO DE OBRA</td>
                       <td className="p-3 text-right font-bold text-obra-green">R$ {(totalDrywallLabor + totalPaintingLabor + totalElectricalLabor).toFixed(2)}</td>
                    </tr>
                 </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">* Materiais listados em anexo (responsabilidade do cliente ou a combinar).</p>
           </div>
            
           {/* CLAUSES (IF APPROVED OR PROPOSAL MODE) */}
           <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Cláusulas e Condições</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                 <li>O pagamento será realizado conforme combinado: entrada de 50% e restante na conclusão.</li>
                 <li>Validade desta proposta: 15 dias.</li>
                 <li>Materiais extras não listados serão cobrados à parte.</li>
                 <li>O local deve estar livre para início dos serviços na data agendada.</li>
                 <li>Garantia de serviço de 90 dias conforme lei vigente.</li>
              </ul>
           </div>

           <div className="mt-16 flex justify-between px-10 text-center">
              <div className="border-t border-gray-300 w-64 pt-2">
                 <p className="font-bold text-gray-800">{user?.name}</p>
                 <p className="text-xs text-gray-500">Contratado</p>
              </div>
              <div className="border-t border-gray-300 w-64 pt-2">
                 <p className="font-bold text-gray-800">{clientName}</p>
                 <p className="text-xs text-gray-500">Contratante</p>
              </div>
           </div>
        </div>

        {/* --- MATERIAL LISTS (SEPARATE PAGE BREAK IN REAL PRINT) --- */}
        <div className="mt-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200 print:mt-10 print:break-before-page">
           <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Lista de Materiais Estimada</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3">
              {[
                { title: 'Drywall', items: drywallMats },
                { title: 'Pintura', items: paintingMats },
                { title: 'Elétrica', items: electricalMats }
              ].map(cat => cat.items.length > 0 && (
                <div key={cat.title}>
                   <h3 className="font-bold text-obra-green mb-3 uppercase text-sm">{cat.title}</h3>
                   <ul className="text-sm space-y-1">
                      {cat.items.map((m, i) => (
                        <li key={i} className="flex justify-between border-b border-gray-100 py-1">
                          <span className="text-gray-700">{m.name}</span>
                          <span className="font-bold">{m.qty} {m.unit}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
        </div>

        {/* ACTIONS BAR (HIDDEN ON PRINT) */}
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3 no-print z-40">
           {status === 'rascunho' ? (
              <button onClick={() => { if(!user?.isPro) { onShowPro() } else { setStatus('aguardando_aceite'); handleSave(); } }} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200">
                 Enviar para Projetos
              </button>
           ) : (
              <select 
                 value={status} 
                 onChange={(e) => setStatus(e.target.value as any)}
                 className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                 <option value="aguardando_aceite">Aguardando Aceite</option>
                 <option value="aceito">Proposta Aceita</option>
                 <option value="em_execucao">Em Execução</option>
                 <option value="concluido">Concluído</option>
              </select>
           )}

           <button onClick={() => handlePrint('materials')} className="px-6 py-3 rounded-xl border border-obra-green text-obra-green font-bold hover:bg-green-50">
              {user?.isPro ? 'Imprimir Materiais' : <span className="flex items-center gap-2"><Icons.Lock /> Lista Materiais</span>}
           </button>
           
           <button onClick={() => handlePrint('proposal')} className="px-6 py-3 rounded-xl bg-obra-green text-white font-bold hover:bg-obra-dark shadow-lg">
              {user?.isPro ? 'Imprimir Proposta' : <span className="flex items-center gap-2"><Icons.Lock /> Proposta Cliente</span>}
           </button>
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('myday')} className="flex items-center gap-2 text-gray-500 hover:text-obra-green"><Icons.ArrowLeft /> <span>Painel</span></button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculadora de Obra</h1>
        <div className="ml-auto flex gap-2">
           <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Cliente" className="bg-white dark:bg-gray-800 border-none rounded-lg p-2 text-sm shadow-sm w-32 md:w-48" />
           <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da Obra" className="bg-white dark:bg-gray-800 border-none rounded-lg p-2 text-sm shadow-sm w-32 md:w-48" />
        </div>
      </div>

      <div className="space-y-6">
        {envs.map((env, index) => (
          <div key={env.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Environment Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-obra-green text-white flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <input 
                    value={env.name} 
                    onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, name: e.target.value} : ev))}
                    className="font-bold bg-transparent text-gray-900 dark:text-white border-b border-dashed border-gray-300 focus:border-obra-green outline-none w-32 md:w-48"
                  />
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                     <input type="number" value={env.width} onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, width: parseFloat(e.target.value)||0} : ev))} className="w-16 p-1 text-center bg-transparent" />
                     <span className="text-gray-400 text-xs px-1">m (L)</span>
                  </div>
                  <span className="text-gray-400">x</span>
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                     <input type="number" value={env.height} onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, height: parseFloat(e.target.value)||0} : ev))} className="w-16 p-1 text-center bg-transparent" />
                     <span className="text-gray-400 text-xs px-1">m (A)</span>
                  </div>
               </div>
               <button onClick={() => removeEnv(env.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
            </div>

            {/* Service Toggles */}
            <div className="p-4 flex gap-4 border-b border-gray-100 dark:border-gray-700">
               {[
                 { id: 'hasDrywall', label: 'Drywall', color: 'text-blue-600' },
                 { id: 'hasPainting', label: 'Pintura', color: 'text-amber-600' },
                 { id: 'hasElectrical', label: 'Elétrica', color: 'text-yellow-600' }
               ].map(srv => (
                 <label key={srv.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={(env as any)[srv.id]} 
                      onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, [srv.id]: e.target.checked} : ev))}
                      className="w-4 h-4 rounded text-obra-green focus:ring-obra-green"
                    />
                    <span className={`font-medium ${srv.color}`}>{srv.label}</span>
                 </label>
               ))}
            </div>

            {/* Services Details */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Drywall Section */}
               {env.hasDrywall && (
                 <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 text-sm uppercase">Drywall</h4>
                    <select 
                      value={env.drywallSubType}
                      onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, drywallSubType: e.target.value as any} : ev))}
                      className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    >
                       <option value="parede">Parede / Divisória</option>
                       <option value="teto">Forro / Rebaixo</option>
                    </select>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                       <label className="text-xs text-blue-800 dark:text-blue-300 font-bold">Mão de Obra (Total)</label>
                       <div className="flex items-center bg-white dark:bg-gray-800 rounded mt-1 border border-blue-100 dark:border-blue-800">
                          <span className="pl-2 text-gray-500 text-sm">R$</span>
                          <input 
                            type="number" 
                            value={env.drywallLaborPrice} 
                            onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, drywallLaborPrice: parseFloat(e.target.value)||0} : ev))}
                            className="w-full p-1 bg-transparent outline-none" 
                          />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-400">Materiais</p>
                       {env.materials.filter(m => m.category === 'drywall').map(m => (
                         <div key={m.id} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-700/50 p-1 rounded">
                            <span>{m.name}</span>
                            <input 
                              type="number" 
                              value={m.quantity} 
                              onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                              className="w-12 text-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                            />
                         </div>
                       ))}
                       <select 
                         onChange={e => { if(e.target.value) addMaterial(env.id, 'drywall', e.target.value); e.target.value=''; }}
                         className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-300"
                       >
                          <option value="">+ Adicionar Item</option>
                          {MATERIAL_DB.drywall.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                    </div>
                 </div>
               )}

               {/* Painting Section */}
               {env.hasPainting && (
                 <div className="space-y-3">
                    <h4 className="font-bold text-amber-600 text-sm uppercase">Pintura</h4>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                       <label className="text-xs text-amber-800 dark:text-amber-300 font-bold">Mão de Obra (Total)</label>
                       <div className="flex items-center bg-white dark:bg-gray-800 rounded mt-1 border border-amber-100 dark:border-amber-800">
                          <span className="pl-2 text-gray-500 text-sm">R$</span>
                          <input 
                            type="number" 
                            value={env.paintingLaborPrice} 
                            onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, paintingLaborPrice: parseFloat(e.target.value)||0} : ev))}
                            className="w-full p-1 bg-transparent outline-none" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-400">Materiais</p>
                       {env.materials.filter(m => m.category === 'painting').map(m => (
                         <div key={m.id} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-700/50 p-1 rounded">
                            <span>{m.name}</span>
                            <input 
                              type="number" 
                              value={m.quantity} 
                              onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                              className="w-12 text-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                            />
                         </div>
                       ))}
                       <select 
                         onChange={e => { if(e.target.value) addMaterial(env.id, 'painting', e.target.value); e.target.value=''; }}
                         className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-300"
                       >
                          <option value="">+ Adicionar Item</option>
                          {MATERIAL_DB.painting.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                    </div>
                 </div>
               )}

               {/* Electrical Section */}
               {env.hasElectrical && (
                 <div className="space-y-3">
                    <h4 className="font-bold text-yellow-600 text-sm uppercase">Elétrica</h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                       <label className="text-xs text-yellow-800 dark:text-yellow-300 font-bold">Mão de Obra (Total)</label>
                       <div className="flex items-center bg-white dark:bg-gray-800 rounded mt-1 border border-yellow-100 dark:border-yellow-800">
                          <span className="pl-2 text-gray-500 text-sm">R$</span>
                          <input 
                            type="number" 
                            value={env.electricalLaborPrice} 
                            onChange={e => setEnvs(envs.map(ev => ev.id === env.id ? {...ev, electricalLaborPrice: parseFloat(e.target.value)||0} : ev))}
                            className="w-full p-1 bg-transparent outline-none" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-400">Materiais (Selecione)</p>
                       {env.materials.filter(m => m.category === 'electrical').map(m => (
                         <div key={m.id} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-700/50 p-1 rounded">
                            <span>{m.name}</span>
                            <input 
                              type="number" 
                              value={m.quantity} 
                              onChange={e => updateMaterialQty(env.id, m.id, parseFloat(e.target.value))}
                              className="w-12 text-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                            />
                         </div>
                       ))}
                       <select 
                         onChange={e => { if(e.target.value) addMaterial(env.id, 'electrical', e.target.value); e.target.value=''; }}
                         className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-300"
                       >
                          <option value="">+ Adicionar Item</option>
                          {MATERIAL_DB.electrical.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ))}
        
        <button onClick={addEnv} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:text-obra-green hover:border-obra-green transition-colors font-bold flex items-center justify-center gap-2">
           <Icons.Plus /> Adicionar Outro Ambiente
        </button>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="text-sm">
           <span className="text-gray-400">Total Mão de Obra:</span>
           <span className="font-bold text-lg ml-2 text-gray-900 dark:text-white">R$ {envs.reduce((a,e) => a + e.drywallLaborPrice + e.paintingLaborPrice + e.electricalLaborPrice, 0).toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
           <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200">
             Salvar
           </button>
           <button onClick={() => setShowSummary(true)} className="px-6 py-3 rounded-xl bg-obra-green text-white font-bold hover:bg-obra-dark shadow-lg">
             Ver Resumo e Finalizar
           </button>
        </div>
      </div>
    </div>
  );
};

// --- (Other views: MyDay, Clients, Config, Projects) stay largely same but need props update if any ---
// (I will keep them concise to fit response, but fully functional)

const MyDayView = ({ user, onNavigate, onShowPro }: { user: User, onNavigate: (tab: string) => void, onShowPro: () => void }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { setProjects(getProjects(user.id)); }, [user]);
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-10"><h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">Meu Dia</h1><div className="flex items-center gap-3 text-gray-500"><span className="capitalize">{new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric'})}</span><span className="w-1 h-1 bg-gray-300 rounded-full"></span><span>Olá, {user.name.split(' ')[0]}</span></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         {[
           { label: 'Em Cotação', val: projects.filter(p => p.status === 'rascunho').length, icon: <Icons.Briefcase />, color: 'text-blue-500' },
           { label: 'Aguardando', val: projects.filter(p => p.status === 'aguardando_aceite').length, icon: <Icons.Send />, color: 'text-amber-500' },
           { label: 'Aprovados', val: projects.filter(p => p.status === 'aceito' || p.status === 'em_execucao').length, icon: <Icons.Check />, color: 'text-green-500' }
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 hover:-translate-y-1 transition-all">
              <div className="flex justify-between mb-4"><span className={`text-xs font-bold uppercase ${stat.color}`}>{stat.label}</span><div className={stat.color}>{stat.icon}</div></div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{stat.val}</div>
           </div>
         ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button onClick={() => onNavigate('calculator')} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-obra-green group text-left">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-obra-green group-hover:bg-obra-green group-hover:text-white transition-colors"><Icons.Plus /></div>
            <div><div className="font-bold text-gray-900 dark:text-white">Nova Cotação</div><div className="text-xs text-gray-500">Calculadora completa</div></div>
         </button>
         <button onClick={() => onNavigate('projects')} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-blue-500 group text-left">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Icons.Briefcase /></div>
            <div><div className="font-bold text-gray-900 dark:text-white">Ver Projetos</div><div className="text-xs text-gray-500">Gestão de obras</div></div>
         </button>
      </div>
    </div>
  );
};

const ProjectsView = ({ user, onEdit }: { user: User, onEdit: (p: Project) => void }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { setProjects(getProjects(user.id)); }, [user]);
  return (
    <div className="max-w-4xl mx-auto py-8">
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Todos os Projetos</h1>
       <div className="grid gap-4">
          {projects.length === 0 && <div className="text-center py-10 text-gray-400">Nenhum projeto salvo.</div>}
          {projects.map(p => (
             <div key={p.id} className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 flex justify-between items-center ${p.status === 'aceito' ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white text-lg">{p.title}</h3>
                   <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{p.clientName}</span><span>•</span><span className="uppercase text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{p.status.replace('_', ' ')}</span>
                   </div>
                </div>
                <button onClick={() => onEdit(p)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"><Icons.Edit /></button>
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

  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) { setUser(sessionUser); setActiveTab('myday'); }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const handleStart = () => {
    const sessionUser = getCurrentUser();
    if (sessionUser) { setUser(sessionUser); setActiveTab('myday'); } else { setShowLoginModal(true); }
  };

  const handleLogin = (name: string, email: string) => {
    const newUser: User = { id: crypto.randomUUID(), name, email, isPro: false };
    saveUser(newUser); setUser(newUser); setShowLoginModal(false); setActiveTab('myday');
  };

  // --- LANDING PAGE ---
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {showLoginModal && <LoginModal onClose={handleLogin} />}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 font-bold text-xl text-obra-green tracking-tighter"><div className="w-8 h-8 bg-obra-green text-white flex items-center justify-center rounded-lg">DF</div>DRYFLOW</div>
          <button onClick={handleStart} className="font-semibold text-gray-700 dark:text-gray-200 hover:text-obra-green">Entrar →</button>
        </header>
        <div className="max-w-3xl text-center z-10 relative">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-obra-green text-sm font-bold mb-6 border border-green-100 dark:border-green-800">Ferramenta do Profissional</div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">Calculadora de Drywall e Pintura <span className="text-obra-green">sem enrolação.</span></h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">Faça orçamentos completos de Drywall, Pintura e Elétrica grátis. Gestão PRO por apenas R$ 49,90.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleStart} className="bg-obra-green hover:bg-obra-dark text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95">Usar calculadora grátis</button>
            <button onClick={handleStart} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-bold py-4 px-10 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Quero ser PRO (vitalício)</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans print:bg-white">
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-obra-green tracking-tighter cursor-pointer" onClick={() => setActiveTab('myday')}>
            <div className="w-8 h-8 bg-obra-green text-white flex items-center justify-center rounded-lg">DF</div><span className="hidden md:inline">DRYFLOW</span>
          </div>
          <div className="flex items-center gap-1 md:gap-6 overflow-x-auto no-scrollbar">
            {[{id:'myday', l:'Meu Dia'}, {id:'projects', l:'Projetos'}, {id:'calculator', l:'Calculadora'}, {id:'config', l:'Config'}].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(tab.id==='calculator') setEditingProject(null); }} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab===tab.id ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{tab.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setTheme(p => p==='light'?'dark':'light')} className="text-gray-400">{theme==='light'?<Icons.Moon />:<Icons.Sun />}</button>
             {user?.isPro ? <span className="text-xs font-bold bg-alert-orange text-white px-2 py-1 rounded">PRO</span> : <button onClick={() => setShowProModal(true)} className="text-sm font-bold text-alert-orange hover:underline">SEJA PRO</button>}
          </div>
        </div>
      </nav>

      <main className="p-4 animate-fade-in print:p-0">
        {activeTab === 'myday' && <MyDayView user={user!} onShowPro={() => setShowProModal(true)} onNavigate={setActiveTab} />}
        {activeTab === 'projects' && <ProjectsView user={user!} onEdit={(p) => { setEditingProject(p); setActiveTab('calculator'); }} />}
        {activeTab === 'calculator' && <CalculatorApp user={user} onShowPro={() => setShowProModal(true)} onNavigate={setActiveTab} existingProject={editingProject} />}
        {activeTab === 'config' && <ConfigView user={user!} onUpdateUser={setUser} onShowPro={() => setShowProModal(true)} />}
      </main>
    </div>
  );
}