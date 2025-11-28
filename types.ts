
export interface User {
  id: string; // Unique identifier (UUID or Google ID)
  name: string;
  email: string;
  isPro: boolean;
  companyName?: string;
  document?: string; // CPF or CNPJ
  phone?: string;
  city?: string;
  photoUrl?: string; // For Google Auth display
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  notes?: string;
}

export type ServiceType = 'drywall' | 'painting' | 'electrical';
export type SubType = 'parede' | 'teto' | 'textura' | 'lisa' | 'pontos' | 'fiacao';

export interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface ExtraItem {
  id: string;
  description: string;
  quantity?: number;
}

export interface CalculationResult {
  area: number;
  materials: MaterialItem[];
  laborUnitDisplay: string; 
}

export interface Project {
  id: string;
  clientId?: string; // Link to client
  clientName: string; // Fallback or display name
  title: string;
  date: string;
  status: 'em_cotacao' | 'enviado' | 'aprovado' | 'finalizado';
  
  serviceType: ServiceType;
  subType: SubType;
  width: number;
  height: number;
  
  extraItems: ExtraItem[]; 
  observations?: string; 
  
  result: CalculationResult;
  aiAdvice?: string;
}

export interface ProFeatureProps {
  isPro: boolean;
  onUpgrade: () => void;
}
