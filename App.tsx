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
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
          <input 
            type="text" 
            value={environment} 
            onChange={e => setEnvironment(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900"
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
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (m)</label>
          <input 
            type="number" 
            value={width} 
            onChange={e => setWidth(parseFloat(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-obra-green outline-none bg-white text-gray-900"
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
      <div className="bg-white text-gray-900 rounded-lg p-6 shadow-xl mt-8 border border-obra-green">
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
        
        {/* Labor Rate Display - Read Only */}
        <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
           <p className="text-xs text-gray-500 mb-1 uppercase">Mão de Obra de Referência</p>
           <p className="text-xl font-mono text-orange-600 font-bold">{calculation.laborUnitDisplay}</p>
        </div>

        <div className="bg-white text-gray-900 rounded p-4">
          <h4 className="font-bold text-obra-dark mb-3 flex items-center">
             <span className="w-2 h-2 bg-obra-green rounded-full mr-2"></span>
             Lista de Materiais (+10%)
          </h4>
          <ul className="space-y-2 text-sm">
            {calculation.materials.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium">{item.quantity} {item.unit}</span>
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
          className="w-full p-2 border rounded text-sm h-24 focus:ring-2 focus:ring-obra