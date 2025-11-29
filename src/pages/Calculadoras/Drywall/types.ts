export interface DrywallInputs {
  width: number;
  height: number;
  deduction: number; // Area of doors/windows in m²
  spacing: number; // usually 0.60
  laborPrice: number;
  hasWool: boolean;
}

export interface DrywallResults {
  areaTotal: number;
  areaUtil: number;
  
  // Materials
  platesCount: number;      // Chapa 1.20x1.80 (un)
  guidesLinear: number;     // Guias (m)
  guidesPieces: number;     // Guias (barras 3m)
  studsCount: number;       // Montantes (un)
  
  screwsPlate: number;      // Parafusos GN25 (un)
  screwsStructure: number;  // Parafusos Metal (un)
  
  tape: number;             // Fita (m² ref - estimate)
  compound: number;         // Massa (kg or m² ref)
  woolRolls: number;        // Lã de vidro (rolos)
  
  // Costs
  laborCost: number;
}
