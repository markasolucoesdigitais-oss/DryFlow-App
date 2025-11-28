import React, { useState, useEffect } from 'react';
import { User, Project, CalculationResult, MaterialItem, ExtraItem, ServiceType, SubType } from './types';
import { getCurrentUser, saveUser, upgradeUserToPro, saveSingleProject, getProjects, deleteProject } from './services/storage';
import { generateProjectAdvice } from './services/gemini';

const PRICE_PRO = "49,90";

const LABOR_RATES: Record<string, Record<string, string>> = {
  drywall: {
    parede: 'R$ 35,00 / m²',
    teto: 'R$ 45,00 / m²',
  },
  painting: {
    textura: 'R$ 25,00 / m²',
    lisa: 'R$ 18,00 / m²',
  },
  electrical: {
    pontos: 'R$ 25,00 / ponto',
    fiacao: 'R$ 15,00 / m',
  }
};

const Icons = {
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-obra-green">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
};

// --- CALCULATOR LOGIC ---

function calculateMaterials(service: ServiceType, subType: SubType, width: number, height: number): { items: MaterialItem[], area: number } {
  const area = width * height;
  const items: MaterialItem[] = [];
  const waste = 1.10; // 10% waste

  if (service === 'drywall') {
    if (subType === 'parede') {
      // Parede standard: 2 sides, montantes every 60cm
      const plateArea = 1.2 * 1.8; // Placa ST padrão
      items.push({ name: 'Placas ST (1.20x1.80)', quantity: Math.ceil((area * 2 * waste) / plateArea), unit: 'un' });
      items.push({ name: 'Montantes 48mm', quantity: Math.ceil((width / 0.6) * (height / 3) * waste), unit: 'un' });
      items.push({ name: 'Guias 48mm', quantity: Math.ceil((width * 2 / 3) * waste), unit: 'un' }); // chão e teto
      items.push({ name: 'Parafuso GN25', quantity: Math.ceil(area * 30 * waste), unit: 'un' });
      items.push({ name: 'Fita Telada', quantity: Math.ceil((area * 1.5) / 45), unit: 'rl' }); // rolo 45m
      items.push({ name: 'Massa Drywall', quantity: Math.ceil(area * 1.5), unit: 'kg' });
    } else if (subType === 'teto') {
      const plateArea = 1.2 * 1.8;
      items.push({ name: 'Placas ST (1.20x1.80)', quantity: Math.ceil((area * waste) / plateArea), unit: 'un' });
      items.push({ name: 'Perfil F530', quantity: Math.ceil((area * 2.5) / 3 * waste), unit: 'un' });
      items.push({ name: 'Tabica/Cantoneira', quantity: Math.ceil(((width + height) * 2) / 3 * waste), unit: 'un' });
      items.push({ name: 'Regulador/Tirante', quantity: Math.ceil(area * 2.5 * waste), unit: 'un' });
      items.push({ name: 'Parafuso GN25', quantity: Math.ceil(area * 20 * waste), unit: 'un' });
    }
  } else if (service === 'painting') {
    if (subType === 'lisa') {
      items.push({ name: 'Massa Corrida (Barrica 25kg)', quantity: Math.ceil(area / 40 * waste), unit: 'un' });
      items.push({ name: 'Tinta Acrílica (Lata 18L)', quantity: Math.ceil(area / 100 * waste), unit: 'un' });
      items.push({ name: 'Selador Acrílico (Lata 18L)', quantity: Math.ceil(area / 200 * waste), unit: 'un' });
      items.push({ name: 'Lixa 150/220', quantity: Math.ceil(area / 5), unit: 'fl' });
    } else if (subType === 'textura') {
      items.push({ name: 'Textura Rústica (Barrica 25kg)', quantity: Math.ceil(area / 15 * waste), unit: 'un' });
      items.push({ name: 'Selador Textura', quantity: Math.ceil(area / 150 * waste), unit: 'un' });
    }
  } else if (service === 'electrical') {
     // Estimativa simplificada
    if (subType === 'pontos') {
       // Treating 'area' as number of points for simplified logic or keeping area as base
       // Let's assume user inputs 'width' as quantity for 'pontos' in a real app, 
       // but here we stick to area as base for simplicity or assume density.
       // Let's assume 1 point per 4m2
       const points = Math.max(1, Math.round(area / 4));
       items.push({ name: 'Caixinha 4x2', quantity: points, unit: 'un' });
       items.push({ name: 'Eletroduto Corrugado 3/4', quantity: Math.ceil(points * 3 * waste), unit: 'm' });
       items.push({ name: 'Cabo 2.5mm', quantity: Math.ceil(points * 15 * waste), unit: 'm' });
    } else {
       items.push({ name: 'Cabo 2.5mm', quantity: Math.ceil(area * 3 * waste), unit: 'm' });
       items.push({ name: 'Disjuntores', quantity: Math.ceil(area / 20), unit: 'un' });
    }
  }

  return { items, area };
}

// --- COMPONENTS ---

const Calculator = ({ isPro, onShowPro, onBack, onSave }: { isPro: boolean, onShowPro: () => void, onBack: () => void, onSave: (p: Project) => void }) => {
  const [environment, setEnvironment] = useState('Sala');
  const [height, setHeight] = useState(2.7);
  const [width, setWidth] = useState(4.0);
  const [service, setService] = useState<ServiceType>('drywall');
  const [subType, setSubType] = useState<SubType>('parede');
  
  const [clientName, setClientName] = useState('Cliente Novo');
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [observations, setObservations] = useState('');
  
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraQty, setNewExtraQty] = useState(1);

  const [calculation, setCalculation] = useState<CalculationResult>({
    area: 0, materials: [], laborUnitDisplay: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Auto-calculate effect
  useEffect(() => {
    if (isNaN(height) || isNaN(width)) return;
    const { items, area } = calculateMaterials(service, subType, width, height);
    
    // Determine labor text
    let laborText = 'Sob Consulta';
    if (LABOR_RATES[service] && LABOR_RATES[service][subType]) {
      laborText = LABOR_RATES[service][subType];
    }

    setCalculation({
      area,
      materials: items,
      laborUnitDisplay: laborText
    });
  }, [height, width, service, subType]);

  const handleAddExtra = () => {
    if (!newExtraName) return;
    const newItem: ExtraItem = {
      id: Date.now().toString(),
      description: newExtraName,
      quantity: newExtraQty
    };
    setExtraItems([...extraItems, newItem]);
    setNewExtraName('');
    setNewExtraQty(1);
  };

  const handleRemoveExtra = (id: string) => {
    setExtraItems(extraItems.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (!isPro) {
      onShowPro();
      return;
    }
    const project: Project = {
      id: Date.now().toString(),
      clientName,
      title: `${service} - ${environment}`,
      date: new Date().toISOString(),
      serviceType: service,
      subType,
      width,
      height,
      extraItems,
      observations,
      result: calculation,
      aiAdvice: aiAdvice || undefined
    };
    onSave(project);
    alert('Orçamento salvo com sucesso!');
  };

  const handlePDF = () => {
    if (!isPro) {
      onShowPro();
      return;
    }
    window.print();
  };

  const handleAI = async () => {
    if (!isPro) {
      onShowPro();
      return;
    }
    setAiLoading(true);
    const materialsList = calculation.materials.map(m => `${m.quantity}${m.unit} ${m.name}`).join(', ');
    const advice = await generateProjectAdvice(service, subType, calculation.area, materialsList);
    setAiAdvice(advice);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 text-gray-500 hover:text-obra-green flex items-center gap-1 text-sm font-medium">
            <Icons.ArrowLeft /> Voltar
          </button>
          <h2 className="text-xl font-bold text-gray-800">Novo Orçamento</h2>
        </div>
        <div className="text-sm text-gray-400">
           {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* INPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Título</label>
          <input 
            type="text" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
          <input 
            type="text" 
            value={environment} 
            onChange={e => setEnvironment(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
          <input 
            type="number" 
            value={height} 
            onChange={e => setHeight(parseFloat(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (m)</label>
          <input 
            type="number" 
            value={width} 
            onChange={e => setWidth(parseFloat(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
          <div className="flex space-x-4">
            {(['drywall', 'painting', 'electrical'] as const).map((s) => (
              <label key={s} className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${service === s ? 'bg-obra-light border-obra-green text-obra-dark' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="service" 
                  checked={service === s} 
                  onChange={() => { setService(s); setSubType(s === 'drywall' ? 'parede' : s === 'painting' ? 'lisa' : 'pontos'); }}
                  className="mr-2 text-obra-green focus:ring-obra-green"
                />
                <span className="capitalize">{s === 'painting' ? 'Pintura' : s === 'electrical' ? 'Elétrica' : 'Drywall'}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
          <div className="flex flex-wrap gap-3">
            {service === 'drywall' && (
              <>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'parede'} onChange={() => setSubType('parede')} className="text-obra-green" /><span>Parede</span></label>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'teto'} onChange={() => setSubType('teto')} className="text-obra-green" /><span>Teto/Forro</span></label>
              </>
            )}
            {service === 'painting' && (
              <>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'lisa'} onChange={() => setSubType('lisa')} className="text-obra-green" /><span>Pintura Lisa</span></label>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'textura'} onChange={() => setSubType('textura')} className="text-obra-green" /><span>Textura</span></label>
              </>
            )}
            {service === 'electrical' && (
              <>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'pontos'} onChange={() => setSubType('pontos')} className="text-obra-green" /><span>Pontos</span></label>
                <label className="flex items-center space-x-2"><input type="radio" checked={subType === 'fiacao'} onChange={() => setSubType('fiacao')} className="text-obra-green" /><span>Fiação</span></label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS BOX */}
      <div className="bg-gray-900 text-white rounded-lg p-6 shadow-xl mt-8">
        <div className="flex justify-between items-end border-b border-gray-700 pb-4 mb-4">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Resumo da Obra</p>
            <p className="text-2xl font-bold">{service.toUpperCase()} - {subType.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Área Total</p>
            <p className="text-3xl font-bold text-obra-green">{calculation.area.toFixed(2)} m²</p>
          </div>
        </div>
        
        {/* Labor Rate Display - Read Only */}
        <div className="mb-6 bg-gray-800 p-3 rounded border border-gray-700">
           <p className="text-xs text-gray-400 mb-1 uppercase">Mão de Obra de Referência</p>
           <p className="text-xl font-mono text-yellow-400">{calculation.laborUnitDisplay}</p>
        </div>

        <div className="bg-white text-gray-900 rounded p-4">
          <h4 className="font-bold text-obra-dark mb-3 flex items-center">
             <span className="w-2 h-2 bg-obra-green rounded-full mr-2"></span>
             Lista de Materiais (+10%)
          </h4>
          <ul className="space-y-2 text-sm">
            {calculation.materials.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                <span className="font-medium">{item.quantity} {item.unit}</span>
                <span className="text-gray-600">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* EXTRAS */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-2">Adicionais (Ex: Caçamba, Andaime)</h4>
        <div className="flex gap-2 mb-2">
          <input 
             type="text" 
             placeholder="Nome (Ex: Frete)" 
             value={newExtraName}
             onChange={e => setNewExtraName(e.target.value)}
             className="flex-1 p-2 border rounded text-sm bg-white text-gray-900"
          />
          <input 
             type="number" 
             placeholder="Qtd" 
             value={newExtraQty}
             onChange={e => setNewExtraQty(parseInt(e.target.value))}
             className="w-20 p-2 border rounded text-sm bg-white text-gray-900"
          />
          <button onClick={handleAddExtra} className="bg-gray-200 hover:bg-gray-300 px-3 rounded text-xl">+</button>
        </div>
        <ul className="space-y-1">
          {extraItems.map(item => (
             <li key={item.id} className="flex justify-between text-sm text-gray-600 bg-white p-2 rounded shadow-sm">
               <span>{item.quantity}x {item.description}</span>
               <button onClick={() => handleRemoveExtra(item.id)} className="text-red-400 hover:text-red-600">x</button>
             </li>
          ))}
        </ul>
      </div>

      {/* OBS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Condições</label>
        <textarea 
          value={observations}
          onChange={e => setObservations(e.target.value)}
          className="w-full p-2 border rounded text-sm h-24 focus:ring-2 focus:ring-obra-green outline-none"
          placeholder="Ex: 50% entrada, validade 15 dias..."
        ></textarea>
      </div>

      {/* AI ADVICE */}
      {aiAdvice && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-indigo-900 text-sm">
           <p className="font-bold mb-1 flex items-center">💡 Dica do Mestre DryFlow</p>
           {aiAdvice}
        </div>
      )}

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button 
          onClick={handleAI}
          className="flex items-center justify-center p-3 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded font-medium hover:bg-indigo-100 transition"
        >
           {!isPro && <Icons.Lock />}
           {aiLoading ? 'Pensando...' : 'Dica do Mestre'}
        </button>
        <div className="col-span-1 grid grid-cols-2 gap-2">
           <button 
             onClick={handleSave}
             className="flex items-center justify-center p-3 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
           >
             {!isPro && <Icons.Lock />}
             Salvar
           </button>
           <button 
             onClick={handlePDF}
             className="flex items-center justify-center p-3 bg-obra-green text-white rounded font-medium hover:bg-green-600 transition shadow"
           >
             {!isPro && <Icons.Lock />}
             Gerar PDF
           </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing'); // Default to landing
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      let currentUser = getCurrentUser();
      if (!currentUser) {
        // Create a default guest user if none exists
        currentUser = {
          id: `guest_${Date.now()}`,
          name: 'Visitante',
          email: '',
          isPro: false,
        };
        saveUser(currentUser);
      }
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const onShowPro = () => {
    if (user && !user.isPro) {
      if (window.confirm(`Deseja fazer o upgrade para a versão PRO por R$ ${PRICE_PRO}?`)) {
        const upgradedUser = upgradeUserToPro(user.id);
        if (upgradedUser) {
          setUser(upgradedUser);
        }
      }
    }
  };

  const handleStart = () => {
    setActiveTab('calculator');
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  // --- LANDING PAGE ---
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <header className="container mx-auto p-6 flex justify-between items-center">
           <div className="text-2xl font-bold tracking-tight text-gray-900">
             DRY<span className="text-obra-green">FLOW</span>
           </div>
           <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
             <button onClick={handleStart} className="hover:text-obra-green">Projetos</button>
             <button onClick={handleStart} className="hover:text-obra-green">Clientes</button>
             <button onClick={handleStart} className="hover:text-obra-green">Configurações</button>
           </nav>
           <button onClick={handleStart} className="text-sm font-bold text-obra-green hover:underline">
             Entrar
           </button>
        </header>

        <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center -mt-20">
           <div className="inline-block bg-green-100 text-obra-dark px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
             Ferramenta do Profissional
           </div>
           <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
             Orçamentos de obra<br/>
             <span className="text-obra-green">sem enrolação.</span>
           </h1>
           <p className="text-lg text-gray-500 max-w-2xl mb-10">
             Calcule material, mão de obra de referência e gere propostas profissionais na hora.
           </p>
           <button 
             onClick={handleStart}
             className="bg-obra-green text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-green-600 hover:scale-105 transition transform"
           >
             Bora Calcular GRÁTIS
           </button>
        </main>

        <footer className="bg-gray-50 border-t py-12">
           <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
             <div className="text-left">
               <h3 className="font-bold text-gray-800 mb-2">Free vs PRO</h3>
               <p className="text-gray-500 text-sm">A versão gratuita calcula tudo. A versão PRO (R$ {PRICE_PRO}) salva, gera PDF e organiza sua vida.</p>
             </div>
             <div className="flex justify-end space-x-4">
                <div className="text-center">
                  <span className="block font-bold text-2xl text-gray-800">∞</span>
                  <span className="text-xs text-gray-500">Cálculos</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-2xl text-gray-800">PDF</span>
                  <span className="text-xs text-gray-500">Profissional</span>
                </div>
             </div>
           </div>
           <div className="text-center mt-10 text-xs text-gray-400">
              <p>Privacidade: Seus dados são usados apenas dentro do DryFlow para organizar seus orçamentos e nunca são compartilhados.</p>
           </div>
        </footer>
      </div>
    );
  }

  // --- APP LAYOUT (CALCULATOR / PROJECTS / SETTINGS) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* APP HEADER */}
      <header className="bg-white border-b sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
           <div className="flex items-center">
              <button onClick={() => setActiveTab('landing')} className="mr-4 text-gray-400 hover:text-gray-900 md:hidden">
                 <Icons.ArrowLeft />
              </button>
              <div className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer" onClick={() => setActiveTab('landing')}>
               DRY<span className="text-obra-green">FLOW</span>
             </div>
           </div>

           {/* DESKTOP NAV */}
           <nav className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calculator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Projetos
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Config
            </button>
           </nav>

           <div className="relative">
              {!user.isPro && (
                <button onClick={onShowPro} className="hidden md:block bg-alert-orange text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-orange-600 transition">
                  SEJA PRO
                </button>
              )}
              {/* MOBILE MENU TRIGGER */}
              <button className="md:hidden ml-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                 <Icons.Menu />
              </button>
              
              {/* MOBILE DROPDOWN */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  <button onClick={() => { setActiveTab('landing'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Início</button>
                  <button onClick={() => { setActiveTab('calculator'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Calculadora</button>
                  <button onClick={() => { setActiveTab('projects'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Projetos</button>
                  <button onClick={() => { setActiveTab('settings'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Configurações</button>
                </div>
              )}
           </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in print:shadow-none print:p-0">
             <Calculator 
                isPro={user.isPro} 
                onShowPro={onShowPro} 
                onBack={() => setActiveTab('landing')} 
                onSave={(p) => saveSingleProject(user.id, p)}
             />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Meus Projetos</h2>
            {!user.isPro ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">O histórico de projetos é exclusivo para membros PRO.</p>
                <button
                  onClick={onShowPro}
                  className="bg-obra-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow transition"
                >
                  Liberar Histórico
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 {getProjects(user.id).length === 0 ? (
                   <p className="text-gray-500 text-center py-8">Nenhum projeto salvo ainda.</p>
                 ) : (
                   getProjects(user.id).map(p => (
                     <div key={p.id} className="border p-4 rounded hover:bg-gray-50 flex justify-between items-center group">
                       <div>
                         <p className="font-bold text-gray-800">{p.clientName}</p>
                         <p className="text-xs text-gray-500">{p.title} • {new Date(p.date).toLocaleDateString()}</p>
                       </div>
                       <button onClick={() => deleteProject(user.id, p.id)} className="opacity-0 group-hover:opacity-100 transition">
                         <Icons.Trash />
                       </button>
                     </div>
                   ))
                 )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Minha Conta</h2>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email || 'Usuário Local'}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Plano Atual</span>
                <span className={`font-bold ${user.isPro ? 'text-obra-green' : 'text-gray-500'}`}>
                  {user.isPro ? 'PRO Vitalício' : 'Gratuito'}
                </span>
              </div>
              {!user.isPro && (
                <button
                  onClick={onShowPro}
                  className="w-full bg-alert-orange text-white font-bold py-3 rounded shadow hover:bg-orange-600 transition mb-6"
                >
                  Fazer Upgrade Agora
                </button>
              )}
            </div>
            <div className="mt-8 pt-8 border-t">
               <h4 className="font-bold text-gray-800 mb-2">Zona de Perigo</h4>
               <p className="text-sm text-gray-500 mb-4">Excluir sua conta removerá todos os orçamentos salvos deste dispositivo.</p>
               <button onClick={() => { if(window.confirm('Tem certeza?')) { import('./services/storage').then(m => m.deleteAccount(user.id)); window.location.reload(); } }} className="text-red-500 text-sm underline hover:text-red-700">Excluir minha conta e dados</button>
            </div>
          </div>
        )}
      </main>

      {/* STICKY FOOTER BANNER FOR FREE USERS */}
      {!user.isPro && activeTab !== 'landing' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur text-white p-4 z-40 border-t border-gray-700 flex justify-between items-center shadow-2xl animate-slide-up no-print">
          <div className="flex flex-col">
            <span className="text-alert-orange font-bold text-sm tracking-wider">VERSÃO GRATUITA</span>
            <span className="text-gray-400 text-xs">Desbloqueie PDF e Histórico</span>
          </div>
          <button 
            onClick={onShowPro}
            className="bg-alert-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg text-sm shadow-lg transform active:scale-95 transition"
          >
            SEJA PRO R$ {PRICE_PRO}
          </button>
        </div>
      )}
    </div>
  );
}
