
export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  companyName?: string;
  document?: string;
  phone?: string;
  city?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  notes?: string;
}

export type ServiceCategory = 'drywall' | 'painting' | 'electrical';

export interface MaterialItem {
  id: string;
  category: ServiceCategory;
  name: string;
  quantity: number;
  unit: string;
  isAutoCalculated?: boolean; // To distinguish base materials from extras
}

export interface Environment {
  id: string;
  name: string; // e.g., "Sala", "Cozinha"
  width: number;
  height: number;
  
  // Service Toggles
  hasDrywall: boolean;
  hasPainting: boolean;
  hasElectrical: boolean;

  // Drywall Specifics
  drywallSubType?: 'parede' | 'teto' | 'recorte';
  drywallLaborPrice: number; // Total or Unit price, handled in logic

  // Painting Specifics
  paintingLaborPrice: number;

  // Electrical Specifics
  electricalLaborPrice: number;

  // Materials for this environment
  materials: MaterialItem[];
}

export interface Task {
  id: string;
  text: string;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  done: boolean;
}

export interface Project {
  id: string;
  clientId?: string;
  clientName: string;
  title: string;
  address?: string; // New field for execution address
  date: string;
  status: 'rascunho' | 'aguardando_aceite' | 'aceito' | 'em_execucao' | 'concluido';
  
  environments: Environment[];
  tasks?: Task[];
  
  // Global Totals (Snapshots)
  totalMaterials: number; // Only quantitative in Free, but we store structure
  totalLabor: number;
  grandTotal: number;

  observations?: string; 
  startDate?: string; // For accepted projects
}
