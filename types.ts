
export interface User {
  id: string; // Unique identifier (UUID or Google ID)
  name: string;
  email: string;
  isPro: boolean;
  companyName?: string;
  phone?: string;
  photoUrl?: string; // For Google Auth display
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
  clientName: string;
  title: string;
  date: string;
  serviceType: ServiceType;
  subType: SubType;
  width: number;
  height: number;
  
  extraItems: ExtraItem[]; 
  observations?: string; 
  paymentTerms?: string; 
  
  result: CalculationResult;
  aiAdvice?: string;
}

export interface ProFeatureProps {
  isPro: boolean;
  onUpgrade: () => void;
}