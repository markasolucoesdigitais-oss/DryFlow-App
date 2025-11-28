
import React, { useState, useEffect } from 'react';
import type { User, Project, Client, CalculationResult, MaterialItem, ExtraItem, ServiceType, SubType } from './types';
import { getCurrentUser, saveUser, upgradeUserToPro, saveSingleProject, getProjects, deleteProject, deleteAccount, getClients, saveSingleClient, deleteClient } from './services/storage';
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
  ArrowLeft: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>),
  Menu: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>),
  Check: () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-obra-green"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>),
  Lock: () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>),
  Trash: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Edit: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
  User: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  Plus: () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>)
};

// --- CALCULATOR LOGIC ---

function calculateMaterials(service: ServiceType, subType: SubType, width: number, height: number): { items: MaterialItem[], area: number } {
  const area = width * height;
  const items: MaterialItem[] = [];
  const waste = 1.10; // 10% waste

  if (service === 'drywall') {
    if (subType === 'parede') {
      const plateArea = 1.2 * 1.8;
      items.push({ name: 'Placas ST (1.20x1.80)', quantity: Math.ceil((area * 2 * waste) / plateArea), unit: 'un' });
      items.push({ name: 'Montantes 48mm', quantity: Math.ceil((width / 0.6) * (height / 3) * waste), unit: 'un' });
      items.push({ name: 'Guias 48mm', quantity: Math.ceil((width * 2 / 3) * waste), unit: 'un' });
      items.push({ name: 'Parafuso GN25', quantity: Math.ceil(area * 30 * waste), unit: 'un' });
      items.push({ name: 'Fita Telada', quantity: Math.ceil((area * 1.5) / 45), unit: 'rl' });
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
    if (subType === 'pontos') {
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

const CalculatorApp = ({ 
  isPro, 
  onShowPro, 
  onSave,
  initialProject,
  clients
}: { 
  isPro: boolean, 
  onShowPro: () => void, 
  onSave: (p: Project) => void,
  initialProject?: Project | null,
  clients: Client[]
}) => {
  const [environment, setEnvironment] = useState(initialProject?.title.split(' - ')[1] || 'Sala');
  const [height, setHeight] = useState(initialProject?.height || 2.7);
  const [width, setWidth] = useState(initialProject?.width || 4.0);
  const [service, setService] = useState<ServiceType>(initialProject?.serviceType || 'drywall');
  const [subType, setSubType] = useState<SubType>(initialProject?.subType || 'parede');
  
  const [clientName, setClientName] = useState(initialProject?.clientName || '');
  const [clientId, setClientId] = useState(initialProject?.clientId || '');
  const [extraItems, setExtraItems] = useState<ExtraItem[]>(initialProject?.extraItems || []);
  const [observations, setObservations] = useState(initialProject?.observations || '');
  
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraQty, setNewExtraQty] = useState(1);
  const [calculation, setCalculation] = useState<CalculationResult>({ area: 0, materials: [], laborUnitDisplay: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(initialProject?.aiAdvice || null);

  useEffect(() => {
    if (initialProject) {
        // Reset state when project changes (if needed)
    }
  }, [initialProject]);

  useEffect(() => {
    if (isNaN(height) || isNaN(width)) return;
    const { items, area } = calculateMaterials(service, subType, width, height);
    
    let laborText = 'Sob Consulta';
    const serviceRates = LABOR_RATES[service];
    if (serviceRates) {
      const rate = (serviceRates as Record<string,string>)[subType];
      if (rate) laborText = rate;
    }

    setCalculation({ area, materials: items, laborUnitDisplay: laborText });
  }, [height, width, service, subType]);

  const handleAddExtra = () => {
    if (!newExtraName) return;
    const newItem: ExtraItem = { id: Date.now().toString(), description: newExtraName, quantity: newExtraQty };
    setExtraItems([...extraItems, newItem]);
    setNewExtraName('');
    setNewExtraQty(1);
  };

  const handleRemoveExtra = (id: string) => {
    setExtraItems(extraItems.filter(i => i.id !== id));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setClientId(id);
      const client = clients.find(c => c.id === id);
      if (client) setClientName(client.name);
      else setClientName('');
  };

  const handleSave = () => {
    if (!isPro) { onShowPro(); return; }
    
    const project: Project = {
      id: initialProject?.id || Date.now().toString(),
      clientId: clientId || undefined,
      clientName: clientName || 'Cliente Novo',
      title: `${service} - ${environment}`,
      date: new Date().toISOString(),
      status: initialProject?.status || 'em_cotacao',
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
    if (!isPro) { onShowPro(); return; }
    window.print();
  };

  const handleAI = async () => {
    if (!isPro) { onShowPro(); return; }
    setAiLoading(true);
    const materialsList = calculation.materials.map(m => `${m.quantity}${m.unit} ${m.name}`).join(', ');
    const advice = await generateProjectAdvice(service, subType, calculation.area, materialsList);
    setAiAdvice(advice);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">Nova Cotação</h2>
      </div>

      {/* INPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <div className="relative">
              <input 
                type="text" 
                list="clients_list"
                value={clientName} 
                onChange={(e) => {
                    setClientName(e.target.value);
                    // Try to match id
                    const match = clients.find(c => c.name === e.target.value);
                    setClientId(match ? match.id : '');
                }}
                placeholder="Nome do Cliente"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900"
              />
              <datalist id="clients_list">
                  {clients.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
          <input type="text" value={environment} onChange={e => setEnvironment(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
          <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (m)</label>
          <input type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900" />
        </div>
      </div>

      {/* SERVICE TYPES */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
          <div className="flex space-x-4">
            {(['drywall', 'painting', 'electrical'] as const).map((s) => (
              <label key={s} className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${service === s ? 'bg-obra-light border-obra-green text-obra-dark' : 'hover:bg-gray-50 bg-white'}`}>
                <input type="radio" name="service" checked={service === s} onChange={() => { setService(s); setSubType(s === 'drywall' ? 'parede' : s === 'painting' ? 'lisa' : 'pontos'); }} className="mr-2 text-obra-green focus:ring-obra-green" />
                <span className="capitalize text-gray-900">{s === 'painting' ? 'Pintura' : s === 'electrical' ? 'Elétrica' : 'Drywall'}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
          <div className="flex flex-wrap gap-3">
             {service === 'drywall' && (<>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'parede'} onChange={() => setSubType('parede')} className="text-obra-green" /><span className="text-gray-900">Parede</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'teto'} onChange={() => setSubType('teto')} className="text-obra-green" /><span className="text-gray-900">Teto/Forro</span></label>
            </>)}
            {service === 'painting' && (<>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'lisa'} onChange={() => setSubType('lisa')} className="text-obra-green" /><span className="text-gray-900">Pintura Lisa</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'textura'} onChange={() => setSubType('textura')} className="text-obra-green" /><span className="text-gray-900">Textura</span></label>
            </>)}
            {service === 'electrical' && (<>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'pontos'} onChange={() => setSubType('pontos')} className="text-obra-green" /><span className="text-gray-900">Pontos</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={subType === 'fiacao'} onChange={() => setSubType('fiacao')} className="text-obra-green" /><span className="text-gray-900">Fiação</span></label>
            </>)}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="bg-white text-gray-900 rounded-lg p-6 shadow-sm border border-obra-green mt-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-4">
          <div>
            <p className="text-gray-500 text-sm uppercase tracking-wider">Resumo da Obra</p>
            <p className="text-2xl font-bold">{service.toUpperCase()} - {subType.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Área Total</p>
            <p className="text-3xl font-bold text-obra-green">{calculation.area.toFixed(2)} m²</p>
          </div>
        </div>
        <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
           <p className="text-xs text-gray-500 mb-1 uppercase">Mão de Obra de Referência</p>
           <p className="text-xl font-mono text-orange-600 font-bold">{calculation.laborUnitDisplay}</p>
        </div>
        <div className="bg-white text-gray-900 rounded p-4">
          <h4 className="font-bold text-obra-dark mb-3 flex items-center"><span className="w-2 h-2 bg-obra-green rounded-full mr-2"></span>Lista de Materiais (+10%)</h4>
          <ul className="space-y-2 text-sm">
            {calculation.materials.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                 <span className="text-gray-600">{item.name}</span>
                 <span className="font-medium text-gray-900">{item.quantity} {item.unit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* EXTRAS */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-2">Adicionais (Ex: Caçamba)</h4>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Nome" value={newExtraName} onChange={e => setNewExtraName(e.target.value)} className="flex-1 p-2 border rounded text-sm bg-white text-gray-900" />
          <input type="number" placeholder="Qtd" value={newExtraQty} onChange={e => setNewExtraQty(parseInt(e.target.value))} className="w-20 p-2 border rounded text-sm bg-white text-gray-900" />
          <button onClick={handleAddExtra} className="bg-gray-200 hover:bg-gray-300 px-3 rounded text-xl text-gray-700">+</button>
        </div>
        <ul className="space-y-1">
          {extraItems.map(item => (
             <li key={item.id} className="flex justify-between text-sm text-gray-600 bg-white p-2 rounded shadow-sm border border-gray-100">
               <span>{item.quantity}x {item.description}</span>
               <button onClick={() => handleRemoveExtra(item.id)} className="text-red-400 hover:text-red-600">x</button>
             </li>
          ))}
        </ul>
      </div>

      {/* OBS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Condições</label>
        <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full p-2 border rounded text-sm h-24 focus:ring-2 focus:ring-obra-green bg-white text-gray-900 outline-none resize-none" placeholder="Ex: 50% entrada, validade 15 dias..." />
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t print:hidden">
        <button onClick={handleAI} disabled={aiLoading} className={`col-span-2 py-3 rounded font-bold text-sm uppercase tracking-wide transition-all border flex items-center justify-center gap-2 ${isPro ? 'border-purple-500 text-purple-600 hover:bg-purple-50' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
          {!isPro && <Icons.Lock />}{aiLoading ? 'Pensando...' : 'Dica do Mestre (IA)'}
        </button>
        <button onClick={handleSave} className={`flex items-center justify-center py-3 rounded font-bold transition-all border ${isPro ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-white border-gray-300 text-gray-700'}`}>
          {!isPro && <Icons.Lock />} Salvar
        </button>
        <button onClick={handlePDF} className={`flex items-center justify-center py-3 rounded font-bold transition-all ${isPro ? 'bg-obra-green text-white hover:bg-opacity-90' : 'bg-obra-green text-white'}`}>
          {!isPro && <Icons.Lock />} Gerar PDF
        </button>
      </div>

      {aiAdvice && <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded text-purple-900 text-sm italic">" {aiAdvice} "</div>}

      {/* PRINT VIEW */}
      <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-[9999] p-8">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">PROPOSTA COMERCIAL</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="mb-8">
          <p><strong>Cliente:</strong> {clientName}</p>
          <p><strong>Projeto:</strong> {service.toUpperCase()} - {environment}</p>
        </div>
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800"><th className="text-left py-2">Descrição</th><th className="text-right py-2">Qtd</th></tr>
          </thead>
          <tbody>
             {calculation.materials.map((m, i) => (<tr key={i} className="border-b border-gray-200"><td className="py-2">{m.name}</td><td className="py-2 text-right">{m.quantity} {m.unit}</td></tr>))}
             {extraItems.map((e) => (<tr key={e.id} className="border-b border-gray-200"><td className="py-2">{e.description}</td><td className="py-2 text-right">{e.quantity}</td></tr>))}
          </tbody>
        </table>
        {observations && <div className="mt-8 border p-4 rounded bg-gray-50"><h3 className="font-bold text-sm mb-2 uppercase">Condições & Observações</h3><p className="whitespace-pre-wrap text-sm">{observations}</p></div>}
        <div className="mt-16 grid grid-cols-2 gap-12 pt-8">
           <div className="border-t border-gray-400 pt-2 text-center text-xs">Assinatura do Profissional</div>
           <div className="border-t border-gray-400 pt-2 text-center text-xs">De acordo (Cliente)</div>
        </div>
      </div>
    </div>
  );
};

// --- PROJECTS VIEW ---
const ProjectsView = ({ onEdit, onNew, isPro, onShowPro }: { onEdit: (p: Project) => void, onNew: () => void, isPro: boolean, onShowPro: () => void }) => {
    const user = getCurrentUser();
    const projects = user ? getProjects(user.id) : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Projetos</h2>
                <button onClick={() => isPro ? onNew() : onShowPro()} className="bg-obra-green text-white px-4 py-2 rounded font-bold hover:bg-obra-dark flex items-center gap-2">
                    <Icons.Plus /> Novo Projeto
                </button>
            </div>
            
            {projects.length === 0 ? (
                 <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    Você ainda não tem orçamentos salvos.
                 </div>
            ) : (
                <div className="grid gap-4">
                    {projects.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{p.title}</h3>
                                <p className="text-sm text-gray-500">{p.clientName} • {new Date(p.date).toLocaleDateString()}</p>
                                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${p.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {p.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="text-right mr-4 hidden md:block">
                                     <p className="text-xs text-gray-400">Total Material</p>
                                     <p className="font-bold text-gray-700">{p.result.materials.length} itens</p>
                                </div>
                                <button onClick={() => { if(isPro) onEdit(p); else onShowPro(); }} className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 font-medium text-sm">
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- CLIENTS VIEW ---
const ClientsView = ({ isPro, onShowPro }: { isPro: boolean, onShowPro: () => void }) => {
    const user = getCurrentUser();
    const [clients, setClients] = useState<Client[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newClient, setNewClient] = useState<Partial<Client>>({});

    useEffect(() => {
        if (user) setClients(getClients(user.id));
    }, [user, showForm]);

    const handleSaveClient = () => {
        if (!newClient.name) return;
        if (user) {
            const success = saveSingleClient(user.id, { 
                id: Date.now().toString(),
                name: newClient.name,
                phone: newClient.phone || '',
                email: newClient.email || '',
                city: newClient.city || '',
                notes: newClient.notes || ''
            });
            
            if (success) {
                setShowForm(false);
                setNewClient({});
            } else {
                onShowPro();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
                <button onClick={() => {
                     if(!isPro && clients.length >= 1) onShowPro();
                     else setShowForm(!showForm);
                }} className="bg-obra-green text-white px-4 py-2 rounded font-bold hover:bg-obra-dark flex items-center gap-2">
                    {showForm ? 'Cancelar' : <><Icons.Plus /> Novo Cliente</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                    <h3 className="font-bold mb-4 text-gray-800">Novo Cadastro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input className="border p-2 rounded bg-white text-gray-900" placeholder="Nome Completo *" value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                        <input className="border p-2 rounded bg-white text-gray-900" placeholder="Telefone / Whatsapp" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                        <input className="border p-2 rounded bg-white text-gray-900" placeholder="Email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                        <input className="border p-2 rounded bg-white text-gray-900" placeholder="Cidade" value={newClient.city || ''} onChange={e => setNewClient({...newClient, city: e.target.value})} />
                    </div>
                    <textarea className="w-full border p-2 rounded mb-4 bg-white text-gray-900" placeholder="Observações" value={newClient.notes || ''} onChange={e => setNewClient({...newClient, notes: e.target.value})} />
                    <button onClick={handleSaveClient} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Salvar Cliente</button>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {clients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Nenhum cliente cadastrado.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4 hidden sm:table-cell">Cidade</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{c.name}</td>
                                    <td className="p-4 text-gray-600">{c.phone}</td>
                                    <td className="p-4 text-gray-600 hidden sm:table-cell">{c.city}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => { if(user) { deleteClient(user.id, c.id); setClients(getClients(user.id)); }}} className="text-red-500 hover:text-red-700">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// --- CONFIG VIEW ---
const ConfigView = () => {
    const user = getCurrentUser();
    const [formData, setFormData] = useState<Partial<User>>({ ...user });
    
    const handleUpdate = () => {
        if(user && formData) {
            saveUser({ ...user, ...formData } as User);
            alert("Dados atualizados!");
        }
    };

    const handleDelete = () => {
        if(confirm("Tem certeza? Isso apagará TODOS os seus dados permanentemente.")) {
            if(user) deleteAccount(user.id);
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Dados do Profissional</h3>
                <p className="text-sm text-gray-500 mb-4">Esses dados aparecerão no cabeçalho dos seus orçamentos PDF.</p>
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Seu Nome / Apelido" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Nome da Empresa (Opcional)" value={formData.companyName || ''} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="CNPJ / CPF" value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Telefone de Contato" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Cidade / UF" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <button onClick={handleUpdate} className="bg-obra-green text-white px-6 py-2 rounded font-bold hover:bg-obra-dark">Salvar Alterações</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Aparência</h3>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tema Escuro</span>
                    <button onClick={() => document.documentElement.classList.toggle('dark')} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 text-gray-800">Alternar Tema</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Privacidade</h3>
                <p className="text-sm text-gray-600 mb-4">Seus dados e orçamentos ficam restritos à sua conta e não são compartilhados com outros usuários.</p>
                <button onClick={handleDelete} className="text-red-500 border border-red-200 bg-red-50 px-4 py-2 rounded hover:bg-red-100 transition text-sm font-medium">Excluir Minha Conta e Dados</button>
            </div>
        </div>
    );
};

// --- MODALS ---
const ProModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
      <div className="w-16 h-16 bg-alert-orange/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚀</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Seja Profissional</h3>
      <p className="text-gray-600 mb-6 text-sm">Libere orçamentos ilimitados, PDF personalizado, histórico e Inteligência Artificial.</p>
      <ul className="text-left text-sm space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
         <li className="flex gap-2"><Icons.Check /> Salvar e Editar Projetos</li>
         <li className="flex gap-2"><Icons.Check /> Gerar PDF Profissional</li>
         <li className="flex gap-2"><Icons.Check /> Consultor IA 24/7</li>
         <li className="flex gap-2"><Icons.Check /> Gestão de Clientes</li>
      </ul>
      <button onClick={() => { if (upgradeUserToPro(getCurrentUser()?.id || '')) { alert('Upgrade realizado com sucesso! (Simulado)'); window.location.reload(); }}} className="w-full bg-alert-orange hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-orange-200">DESBLOQUEAR TUDO R$ {PRICE_PRO}</button>
      <p className="text-xs text-gray-400 mt-3">Pagamento único. Acesso vitalício.</p>
    </div>
  </div>
);

const LoginModal = ({ onSubmit }: { onSubmit: (name: string, email: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
       <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
          <div className="mb-4"><span className="text-2xl font-bold tracking-tighter">DRY<span className="text-obra-green">FLOW</span></span></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo!</h3>
          <p className="text-gray-600 mb-6 text-sm">Insira seus dados para começar a calcular.</p>
          <input className="w-full p-3 border rounded mb-3 bg-white text-gray-900 focus:ring-2 focus:ring-obra-green outline-none" placeholder="Seu Nome" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full p-3 border rounded mb-6 bg-white text-gray-900 focus:ring-2 focus:ring-obra-green outline-none" placeholder="Seu Melhor E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <button onClick={() => { if(name && email) onSubmit(name, email); }} className="w-full bg-obra-green text-white font-bold py-3 rounded-xl hover:bg-obra-dark transition active:scale-95" disabled={!name || !email}>Bora Calcular 🚀</button>
       </div>
    </div>
  );
}

// --- LANDING PAGE ---
const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-white text-gray-900 font-sans">
    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
       <div className="text-2xl font-bold tracking-tighter">DRY<span className="text-obra-green">FLOW</span></div>
       <button onClick={onStart} className="text-sm font-semibold leading-6 text-gray-900 hover:text-obra-green">Entrar <span aria-hidden="true">&rarr;</span></button>
    </nav>
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
       <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-obra-green ring-1 ring-inset ring-obra-green/20 bg-obra-light mb-8">Ferramenta do Profissional</div>
       <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">Orçamentos de obra <span className="text-obra-green">sem enrolação.</span></h1>
       <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Calcule material, mão de obra de referência e gere propostas profissionais na hora.</p>
       <button onClick={onStart} className="bg-obra-green hover:bg-obra-dark text-white text-lg font-bold py-4 px-10 rounded-full transition-all shadow-xl shadow-green-200 hover:shadow-2xl active:scale-95">Bora Calcular GRÁTIS</button>
    </main>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'calculator' | 'projects' | 'clients' | 'config'>('landing');
  const [showProModal, setShowProModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // State to hold a project being edited or re-opened
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
       setUser(currentUser);
       setClients(getClients(currentUser.id));
    }
  }, [activeTab]); // Refresh clients/user data on tab switch

  const handleStart = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setActiveTab('calculator');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = (name: string, email: string) => {
    const newUser: User = { id: Date.now().toString(), name, email, isPro: false };
    saveUser(newUser);
    setUser(newUser);
    setShowLoginModal(false);
    setActiveTab('calculator');
  };

  // When a user clicks "New Project" (or "Calculadora" from menu), reset current project
  const handleNewProject = () => {
      setCurrentProject(null);
      setActiveTab('calculator');
  };

  const handleEditProject = (p: Project) => {
      setCurrentProject(p);
      setActiveTab('calculator');
  };

  // Navbar Component inside Main App
  const Navbar = () => (
      <nav className="bg-obra-green shadow-lg">
          <div className="max-w-4xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
                       <span className="font-bold text-white text-xl tracking-tight">DRYFLOW</span>
                  </div>
                  <div className="hidden md:flex space-x-4">
                      <button onClick={handleNewProject} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'calculator' ? 'bg-obra-dark text-white' : 'text-white hover:bg-obra-dark/50'}`}>Calculadora</button>
                      <button onClick={() => setActiveTab('projects')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'projects' ? 'bg-obra-dark text-white' : 'text-white hover:bg-obra-dark/50'}`}>Projetos</button>
                      <button onClick={() => setActiveTab('clients')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'clients' ? 'bg-obra-dark text-white' : 'text-white hover:bg-obra-dark/50'}`}>Clientes</button>
                      <button onClick={() => setActiveTab('config')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'config' ? 'bg-obra-dark text-white' : 'text-white hover:bg-obra-dark/50'}`}>Config</button>
                  </div>
                  <div className="flex items-center">
                       {user?.isPro && <span className="bg-white text-obra-green text-xs font-bold px-2 py-1 rounded-full mr-2">PRO</span>}
                       <div className="md:hidden">
                           {/* Mobile Menu Placeholder - For simplicity, just using icons/logic or relying on bottom/scroll. 
                               For this spec, distinct mobile menu isn't explicitly detailed, so we assume desktop nav wraps or basic access. 
                               We'll add a simple row below for mobile if needed, but horizontal scroll usually works. */}
                       </div>
                       <button onClick={() => { /* Logout logic could go here */ setActiveTab('landing'); }} className="text-white hover:text-gray-200 ml-2"><Icons.User /></button>
                  </div>
              </div>
              {/* Mobile Menu Row */}
              <div className="flex md:hidden justify-between pb-2 overflow-x-auto text-white text-sm">
                  <button onClick={handleNewProject} className="px-2">Calculadora</button>
                  <button onClick={() => setActiveTab('projects')} className="px-2">Projetos</button>
                  <button onClick={() => setActiveTab('clients')} className="px-2">Clientes</button>
                  <button onClick={() => setActiveTab('config')} className="px-2">Config</button>
              </div>
          </div>
      </nav>
  );

  if (activeTab === 'landing') {
    return (
        <div className="bg-white min-h-screen">
            <LandingPage onStart={handleStart} />
            <footer className="mt-12 py-6 text-center text-xs text-gray-400 border-t border-gray-100"><p>© 2024 DryFlow App.</p></footer>
            {showLoginModal && <LoginModal onSubmit={handleLoginSubmit} />}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-6 px-4">
        {activeTab === 'calculator' && (
           <CalculatorApp 
             isPro={!!user?.isPro} 
             onShowPro={() => setShowProModal(true)} 
             onSave={(p) => saveSingleProject(user!.id, p)}
             initialProject={currentProject}
             clients={clients}
           />
        )}
        
        {activeTab === 'projects' && (
            <ProjectsView 
                onEdit={handleEditProject} 
                onNew={handleNewProject}
                isPro={!!user?.isPro}
                onShowPro={() => setShowProModal(true)}
            />
        )}

        {activeTab === 'clients' && (
            <ClientsView isPro={!!user?.isPro} onShowPro={() => setShowProModal(true)} />
        )}

        {activeTab === 'config' && (
            <ConfigView />
        )}
      </div>

      {/* STICKY BOTTOM BANNER FOR FREE USERS */}
      {!user?.isPro && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-40 border-t border-gray-800 animate-slide-up print:hidden">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-sm">
              <span className="font-bold text-alert-orange">VERSÃO GRATUITA</span>
              <p className="text-gray-400 text-xs hidden sm:block">Desbloqueie PDF e Histórico</p>
            </div>
            <button onClick={() => setShowProModal(true)} className="bg-alert-orange text-white font-bold py-2 px-6 rounded hover:bg-amber-600 transition shadow-lg text-sm">SEJA PRO R$ {PRICE_PRO}</button>
          </div>
        </div>
      )}

      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
    </div>
  );
}
