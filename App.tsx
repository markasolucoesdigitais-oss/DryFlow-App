import React, { useState, useEffect } from 'react';
import { generateProjectAdvice } from './services/gemini';
import { 
  getCurrentUser, 
  saveUser, 
  upgradeUserToPro, 
  getProjects, 
  saveSingleProject, 
  getClients, 
  saveSingleClient,
  deleteAccount
} from './services/storage';
import { Project, User, ServiceType, SubType, CalculationResult, MaterialItem, Client } from './types';

// --- ICONS ---
const Icons = {
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  ),
  Calculator: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line><line x1="8" y1="18" x2="8" y2="18"></line></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  ),
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
  ),
  Magic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
  ),
  Calendar: () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  Send: () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  ),
  QrCode: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  )
};

const LABOR_RATES: Record<string, string> = {
  'drywall-parede': 'R$ 35,00 / m²',
  'drywall-teto': 'R$ 45,00 / m²',
  'painting-lisa': 'R$ 18,00 / m²',
  'painting-textura': 'R$ 25,00 / m²',
  'electrical-pontos': 'R$ 60,00 / ponto',
  'electrical-fiacao': 'R$ 12,00 / m'
};

const PRICE_PRO = "49,90";

const LoginModal = ({ onClose }: { onClose: (name: string, email: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) onClose(name, email);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Começar Gratuitamente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu Nome</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} 
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Ex: João Silva" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu E-mail</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} 
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="joao@email.com" />
          </div>
          <button type="submit" className="w-full bg-obra-green hover:bg-obra-dark text-white font-bold py-3 rounded-xl transition-colors">
            Acessar Calculadora
          </button>
        </form>
      </div>
    </div>
  );
};

const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-200 dark:border-gray-700">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
      <div className="text-center">
        <div className="bg-alert-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👑</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seja Profissional</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Libere recursos vitais para crescer seu negócio por apenas <span className="font-bold text-obra-green">R$ {PRICE_PRO}</span> (pagamento único).</p>
        
        <div className="grid gap-3 text-left mb-6">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Salvar orçamentos ilimitados</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Gerar PDF profissional</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Gestão de clientes (CRM)</span></div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><Icons.Check /><span className="text-sm">Dicas de Mestre (IA)</span></div>
        </div>

        <button className="w-full bg-alert-orange hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-orange-500/30">
          QUERO SER PRO
        </button>
        <p className="text-xs text-gray-400 mt-4">Acesso vitalício. Garantia de 7 dias.</p>
      </div>
    </div>
  </div>
);

const DigitalCardModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  // Construct vCard format
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
ORG:${user.companyName || 'Autônomo'}
TEL:${user.phone || ''}
EMAIL:${user.email}
ADR:;;${user.city || ''};;;
END:VCARD`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vcard)}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative border border-gray-200 dark:border-gray-700 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seu Cartão Digital</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Peça para seu cliente escanear para salvar seu contato na hora.</p>
        
        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 inline-block mb-6">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>

        <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
           <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
           <div className="text-sm text-gray-500 dark:text-gray-400">{user.companyName}</div>
           <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.phone}</div>
           <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

const CalculatorApp = ({ 
  user, 
  onShowPro,
  onNavigate,
  existingProject = null
}: { 
  user: User | null, 
  onShowPro: () => void,
  onNavigate: (tab: string) => void,
  existingProject?: Project | null
}) => {
  const [clientName, setClientName] = useState(existingProject?.clientName || '');
  const [title, setTitle] = useState(existingProject?.title || '');
  const [ambient, setAmbient] = useState('');
  const [height, setHeight] = useState(existingProject?.height || 2.7);
  const [width, setWidth] = useState(existingProject?.width || 4.0);
  const [service, setService] = useState<ServiceType>(existingProject?.serviceType || 'drywall');
  const [subType, setSubType] = useState<SubType>(existingProject?.subType || 'parede');
  const [observations, setObservations] = useState(existingProject?.observations || '');
  const [extraItems, setExtraItems] = useState<any[]>(existingProject?.extraItems || []);
  const [projectStatus, setProjectStatus] = useState<Project['status']>(existingProject?.status || 'em_cotacao');
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [laborPrice, setLaborPrice] = useState('');

  // Auto calculate
  useEffect(() => {
    const area = height * width;
    let materials: MaterialItem[] = [];

    if (service === 'drywall') {
      if (subType === 'parede') {
        materials = [
          { name: 'Placas ST (1.20x1.80)', quantity: Math.ceil(area / 2.16), unit: 'un' },
          { name: 'Montantes 48mm', quantity: Math.ceil(width / 0.6), unit: 'un' },
          { name: 'Guias 48mm', quantity: Math.ceil(width / 3) * 2, unit: 'un' },
          { name: 'Parafuso GN25', quantity: Math.ceil(area * 20), unit: 'un' },
          { name: 'Fita Telada', quantity: 1, unit: 'rl' },
          { name: 'Massa Drywall', quantity: Math.ceil(area * 0.5), unit: 'sc' }
        ];
      } else {
         materials = [
          { name: 'Placas ST (1.20x1.80)', quantity: Math.ceil(area / 2.16), unit: 'un' },
          { name: 'Perfis F530', quantity: Math.ceil(area * 1.5), unit: 'un' },
          { name: 'Tabica', quantity: Math.ceil((width + height) * 2 / 3), unit: 'un' },
        ];
      }
    } else if (service === 'painting') {
      materials = [
        { name: 'Tinta Acrílica (18L)', quantity: Math.ceil(area / 100), unit: 'lt' },
        { name: 'Selador', quantity: Math.ceil(area / 150), unit: 'lt' },
        { name: 'Lixa 120', quantity: Math.ceil(area / 10), unit: 'un' },
      ];
    } else {
       materials = [
        { name: 'Caixas 4x2', quantity: Math.ceil(area / 5), unit: 'un' },
        { name: 'Fio 2.5mm', quantity: Math.ceil(area * 2), unit: 'm' },
      ];
    }

    // Add 10% waste
    materials = materials.map(m => ({
      ...m,
      quantity: Math.ceil(m.quantity * 1.10)
    }));

    const laborKey = `${service}-${subType}`;
    const rate = LABOR_RATES[laborKey] || 'A combinar';
    setLaborPrice(rate);

    setResult({
      area,
      materials,
      laborUnitDisplay: rate
    });
  }, [height, width, service, subType]);

  const handleSave = () => {
    if (!user?.isPro) {
      onShowPro();
      return;
    }
    if (!result) return;
    
    const project: Project = {
      id: existingProject?.id || crypto.randomUUID(),
      clientId: '', 
      clientName: clientName || 'Cliente Novo',
      title: title || `${service} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: projectStatus,
      serviceType: service,
      subType,
      height,
      width,
      extraItems,
      observations,
      result
    };

    saveSingleProject(user.id, project);
    alert('Orçamento salvo com sucesso!');
    onNavigate('myday'); // Return to dashboard
  };

  const handleAI = async () => {
    if (!user?.isPro) {
      onShowPro();
      return;
    }
    const advice = await generateProjectAdvice(service, subType, result?.area || 0, result?.materials.map(m => m.name).join(', ') || '');
    alert(advice);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header with Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-gray-500 hover:text-obra-green transition-colors dark:text-gray-400 dark:hover:text-obra-green"
        >
          <div className="flex items-center gap-1 font-bold text-gray-800 dark:text-white">
            <Icons.ArrowLeft />
            <span>DRYFLOW</span>
          </div>
        </button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {existingProject ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* INPUTS COLUMN */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
             <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cliente / Título</label>
              <input 
                value={clientName} 
                onChange={e => setClientName(e.target.value)}
                placeholder="Nome do Cliente"
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Altura (m)</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={e => setHeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Comp. (m)</label>
                <input 
                  type="number" 
                  value={width} 
                  onChange={e => setWidth(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-obra-green outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Serviço</label>
              <div className="grid grid-cols-3 gap-2">
                {(['drywall', 'painting', 'electrical'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setService(s)}
                    className={`p-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                      service === s 
                      ? 'bg-obra-light dark:bg-obra-dark/40 border-obra-green text-obra-dark dark:text-obra-light' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {s === 'painting' ? 'Pintura' : s === 'electrical' ? 'Elétrica' : 'Drywall'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subtipo</label>
              <div className="flex flex-wrap gap-2">
                {service === 'drywall' && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'parede'} onChange={() => setSubType('parede')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Parede</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'teto'} onChange={() => setSubType('teto')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Teto</span>
                    </label>
                  </>
                )}
                 {service === 'painting' && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'lisa'} onChange={() => setSubType('lisa')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Rolo/Lisa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'textura'} onChange={() => setSubType('textura')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Textura</span>
                    </label>
                  </>
                )}
                 {service === 'electrical' && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'pontos'} onChange={() => setSubType('pontos')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tomadas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sub" checked={subType === 'fiacao'} onChange={() => setSubType('fiacao')} className="accent-obra-green"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Fiação</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
               <select 
                  value={projectStatus} 
                  onChange={(e) => setProjectStatus(e.target.value as any)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="em_cotacao">Rascunho (Em cotação)</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
               </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Observações / Condições</label>
             <textarea 
               value={observations}
               onChange={e => setObservations(e.target.value)}
               className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm h-24 text-gray-900 dark:text-white resize-none"
               placeholder="Ex: 50% entrada, validade 15 dias..."
             />
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-obra-green overflow-hidden">
             <div className="bg-obra-green p-4 flex justify-between items-center text-white">
                <span className="font-bold text-lg uppercase tracking-wide">{service} - {subType}</span>
                <div className="text-right">
                   <div className="text-xs opacity-80">Área Total</div>
                   <div className="text-2xl font-bold">{result?.area.toFixed(2)} m²</div>
                </div>
             </div>
             
             <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 mb-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mão de obra de referência</span>
                   <span className="text-xl font-bold text-alert-orange">{laborPrice}</span>
                </div>

                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-obra-green uppercase tracking-wider flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-obra-green"></span>
                     Lista de Materiais (+10%)
                   </h3>
                   <div className="space-y-2">
                      {result?.materials.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded transition-colors">
                           <span className="text-gray-700 dark:text-gray-200">{m.name}</span>
                           <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm min-w-[3rem] text-center">
                             {m.quantity} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{m.unit}</span>
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
             <button onClick={handleAI} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                <Icons.Magic />
                {user?.isPro ? 'Dica do Mestre' : 'Dica (Pro)'}
             </button>
             
             <button onClick={() => user?.isPro ? onShowPro() : onShowPro()} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold transition-colors ${user?.isPro ? 'border-obra-green text-obra-green hover:bg-green-50' : 'border-gray-200 text-gray-400'}`}>
                {user?.isPro ? <Icons.Download /> : <Icons.Lock />}
                Gerar PDF
             </button>

             <button onClick={handleSave} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${user?.isPro ? 'bg-obra-green text-white hover:bg-obra-dark' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                {user?.isPro ? <Icons.Check /> : <Icons.Lock />}
                Salvar Orçamento
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyDayView = ({ user, onNavigate, onShowPro }: { user: User, onNavigate: (tab: string) => void, onShowPro: () => void }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    setProjects(getProjects(user.id));
  }, [user]);

  const quoting = projects.filter(p => p.status === 'em_cotacao').length;
  const sent = projects.filter(p => p.status === 'enviado').length;
  const approved = projects.filter(p => p.status === 'aprovado').length;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
           <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">Meu Dia</h1>
           <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <span className="capitalize">{today}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span>Olá, {user.name.split(' ')[0]}</span>
           </div>
        </div>
      </div>

      {/* STATS GRID - 3 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Em Cotação</span>
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors"><Icons.Briefcase /></div>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{quoting}</div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Enviadas</span>
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors"><Icons.Send /></div>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{sent}</div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-green-500 transition-colors">Aprovadas</span>
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors"><Icons.Check /></div>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{approved}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Acesso Rápido</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => onNavigate('calculator')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-obra-green group transition-all text-left">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-obra-green group-hover:bg-obra-green group-hover:text-white transition-colors">
                    <Icons.Plus />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Nova Cotação</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Calculadora completa</div>
                  </div>
               </button>
               <button onClick={() => onNavigate('clients')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-blue-500 group transition-all text-left">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Icons.User />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Novo Cliente</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cadastrar contato</div>
                  </div>
               </button>
            </div>
         </div>
         
         <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Tarefas</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center py-10">
               <div className="text-4xl mb-3">☕</div>
               <p className="text-gray-500 dark:text-gray-400">Tudo limpo por hoje.</p>
               <button className="text-sm text-obra-green font-bold mt-2 hover:underline">Adicionar tarefa</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const ProjectsView = ({ user, onEdit }: { user: User, onEdit: (p: Project) => void }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Only show Approved projects here
    setProjects(getProjects(user.id).filter(p => p.status === 'aprovado'));
  }, [user]);

  if (projects.length === 0) {
     return (
        <div className="text-center py-20">
           <div className="text-6xl mb-4">📂</div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nenhum projeto aprovado</h2>
           <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">Os orçamentos que você marcar como "Aprovado" aparecerão aqui.</p>
        </div>
     )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Projetos Aprovados</h1>
       <div className="grid gap-4">
          {projects.map(p => (
             <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-l-4 border-l-obra-green border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white text-lg">{p.title}</h3>
                   <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{p.clientName}</span>
                      <span>•</span>
                      <span>{new Date(p.date).toLocaleDateString()}</span>
                   </div>
                </div>
                <button onClick={() => onEdit(p)} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                   Abrir
                </button>
             </div>
          ))}
       </div>
    </div>
  );
};

const ClientsView = ({ user, onShowPro }: { user: User, onShowPro: () => void }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', city: '' });

  useEffect(() => {
    setClients(getClients(user.id));
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    const success = saveSingleClient(user.id, {
      id: crypto.randomUUID(),
      ...newClient
    });

    if (!success) {
      onShowPro();
      return;
    }
    
    setClients(getClients(user.id));
    setShowForm(false);
    setNewClient({ name: '', phone: '', city: '' });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Clientes</h1>
          <button onClick={() => setShowForm(true)} className="bg-obra-green text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-obra-dark transition-colors flex items-center gap-2">
             <Icons.Plus /> Novo Cliente
          </button>
       </div>

       {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 animate-fade-in">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cadastrar Cliente</h3>
             <form onSubmit={handleSave} className="grid gap-4">
                <input required placeholder="Nome Completo" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                <div className="grid grid-cols-2 gap-4">
                   <input placeholder="WhatsApp" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                   <input placeholder="Cidade/Bairro" value={newClient.city} onChange={e => setNewClient({...newClient, city: e.target.value})} className="p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                   <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancelar</button>
                   <button type="submit" className="bg-obra-green text-white px-6 py-2 rounded-lg font-bold">Salvar</button>
                </div>
             </form>
          </div>
       )}

       {clients.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
             <p className="text-gray-400">Nenhum cliente cadastrado.</p>
          </div>
       ) : (
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                     <th className="p-4">Nome</th>
                     <th className="p-4">Contato</th>
                     <th className="p-4">Local</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {clients.map(c => (
                     <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{c.phone || '-'}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{c.city || '-'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
       )}
    </div>
  );
};

const ConfigView = ({ user, onUpdateUser, onLogout }: { user: User, onUpdateUser: (u: User) => void, onLogout: () => void }) => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [showQR, setShowQR] = useState(false);

  const handleSaveProfile = () => {
    saveUser(editedUser);
    onUpdateUser(editedUser);
    alert("Perfil atualizado com sucesso!");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
       {showQR && <DigitalCardModal user={user} onClose={() => setShowQR(false)} />}
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>
       
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white mb-1">Perfil do Profissional</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Seus dados para orçamentos e cartão digital.</p>
             </div>
             <button onClick={handleSaveProfile} className="text-sm font-bold text-obra-green hover:underline">
               Salvar Alterações
             </button>
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Exibição</label>
                <input 
                  value={editedUser.name} 
                  onChange={e => setEditedUser({...editedUser, name: e.target.value})}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa (Opcional)</label>
                <input 
                  value={editedUser.companyName || ''} 
                  onChange={e => setEditedUser({...editedUser, companyName: e.target.value})}
                  placeholder="Ex: Silva Reformas"
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp</label>
                  <input 
                    value={editedUser.phone || ''} 
                    onChange={e => setEditedUser({...editedUser, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                  <input 
                    value={editedUser.city || ''} 
                    onChange={e => setEditedUser({...editedUser, city: e.target.value})}
                    placeholder="Sua Cidade"
                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail (Login)</label>
                <input readOnly value={editedUser.email} className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"/>
             </div>
          </div>
       </div>
  
       {/* DIGITAL CARD SECTION */}
       <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Icons.QrCode />
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="bg-white/20 p-1 rounded"><Icons.QrCode /></span> 
                  Cartão de Visita Digital
                </h3>
                <p className="text-gray-300 text-sm max-w-sm">Gere um QR Code automático com seus dados de contato. Seu cliente escaneia e salva na agenda na hora.</p>
             </div>
             <button onClick={() => setShowQR(true)} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap">
                Gerar Cartão Digital
             </button>
          </div>
       </div>

       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
          <h3 className="font-bold text-red-600 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Excluir todos os seus dados e orçamentos deste dispositivo.</p>
          <button onClick={() => { if(confirm('Tem certeza? Isso apaga tudo.')) onLogout(); }} className="text-red-600 text-sm font-bold hover:underline flex items-center gap-2">
             <Icons.Trash /> Excluir minha conta e dados
          </button>
       </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('landing'); // landing, myday, calculator, clients, projects, config
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Check Session & Theme
  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      setActiveTab('myday');
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleStart = () => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      setActiveTab('myday');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = (name: string, email: string) => {
    const newUser: User = { id: crypto.randomUUID(), name, email, isPro: false };
    saveUser(newUser);
    setUser(newUser);
    setShowLoginModal(false);
    setActiveTab('myday');
  };

  const handleLogout = () => {
    if (user) deleteAccount(user.id);
    setUser(null);
    setActiveTab('landing');
  };

  const handleUpgrade = () => {
    if (user) {
      const upgraded = upgradeUserToPro(user.id);
      if (upgraded) {
        setUser(upgraded);
        setShowProModal(false);
        alert('Bem-vindo ao PRO! Todos os recursos liberados.');
      }
    }
  };

  // --- RENDER ---

  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        {showLoginModal && <LoginModal onClose={handleLogin} />}
        
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-obra-green tracking-tighter">
            <div className="w-8 h-8 bg-obra-green text-white flex items-center justify-center rounded-lg">DF</div>
            DRYFLOW
          </div>
          <button onClick={handleStart} className="font-semibold text-gray-700 dark:text-gray-200 hover:text-obra-green flex items-center gap-1">
            Entrar <span>→</span>
          </button>
        </header>

        <div className="max-w-2xl text-center animate-fade-in mt-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-obra-green text-sm font-bold mb-6 border border-green-100 dark:border-green-800">
            Ferramenta do Profissional
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Orçamentos de obra <span className="text-obra-green">sem enrolação.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Calcule material, mão de obra de referência e gere propostas profissionais na hora.
          </p>
          <button 
            onClick={handleStart}
            className="bg-obra-green hover:bg-obra-dark text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
          >
            Bora Calcular GRÁTIS
          </button>
        </div>
        
        <div className="absolute bottom-6 text-sm text-gray-400 dark:text-gray-600">
           © 2024 DryFlow. Simples e Seguro.
        </div>
      </div>
    );
  }

  // APP LAYOUT
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
      {/* NAVBAR */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-obra-green tracking-tighter cursor-pointer" onClick={() => setActiveTab('myday')}>
            <div className="w-8 h-8 bg-obra-green text-white flex items-center justify-center rounded-lg">DF</div>
            <span className="hidden md:inline">DRYFLOW</span>
          </div>

          <div className="flex items-center gap-1 md:gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'myday', label: 'Meu Dia' },
              { id: 'clients', label: 'Clientes' },
              { id: 'projects', label: 'Projetos' },
              { id: 'calculator', label: 'Calculadora' },
              { id: 'config', label: 'Config' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if(tab.id === 'calculator') setEditingProject(null); }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-300 transition-colors">
                {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
             </button>
             {user?.isPro ? (
               <span className="text-xs font-bold bg-alert-orange text-white px-2 py-1 rounded">PRO</span>
             ) : (
               <button onClick={() => setShowProModal(true)} className="text-sm font-bold text-alert-orange hover:underline">
                 SEJA PRO
               </button>
             )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="p-4 animate-fade-in">
        {activeTab === 'myday' && <MyDayView user={user!} onShowPro={() => setShowProModal(true)} onNavigate={setActiveTab} />}
        {activeTab === 'clients' && <ClientsView user={user!} onShowPro={() => setShowProModal(true)} />}
        {activeTab === 'projects' && <ProjectsView user={user!} onEdit={(p) => { setEditingProject(p); setActiveTab('calculator'); }} />}
        {activeTab === 'calculator' && (
           <CalculatorApp 
             user={user} 
             onShowPro={() => setShowProModal(true)} 
             onNavigate={setActiveTab} 
             existingProject={editingProject}
           />
        )}
        {activeTab === 'config' && <ConfigView user={user!} onUpdateUser={setUser} onLogout={handleLogout} />}
      </main>

      {/* STICKY FOOTER FOR FREE USERS */}
      {!user?.isPro && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 dark:bg-black text-white p-3 flex justify-between items-center z-40 shadow-lg border-t border-gray-800">
          <div className="text-sm px-2">
            <span className="font-bold text-alert-orange">VERSÃO GRATUITA</span>
            <span className="hidden sm:inline text-gray-400 ml-2">Desbloqueie PDF e Histórico</span>
          </div>
          <button 
            onClick={handleUpgrade}
            className="bg-alert-orange hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
          >
            SEJA PRO R$ {PRICE_PRO}
          </button>
        </div>
      )}
    </div>
  );
}