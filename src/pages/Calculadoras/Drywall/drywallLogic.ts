import { DrywallInputs, DrywallResults } from './types';

export const calculateDrywall = (inputs: DrywallInputs): DrywallResults => {
  const { width, height, deduction, spacing, laborPrice, hasWool } = inputs;

  // 1. Área
  const areaTotal = width * height;
  const areaUtil = Math.max(0, areaTotal - deduction);

  // 2. Placas (1.20 x 1.80 = 2.16 m²)
  const platesCount = Math.ceil(areaUtil / 2.16);

  // 3. Guias = Comprimento * 2
  const guidesLinear = width * 2;
  const guidesPieces = Math.ceil(guidesLinear / 3); // Considerando barras de 3m

  // 4. Montantes = Comprimento / Espaçamento (0.60 m)
  const spacingVal = spacing > 0 ? spacing : 0.60;
  let studsCount = Math.ceil(width / spacingVal);
  
  // Montantes extras quando há vão: +3
  if (deduction > 0) {
    studsCount += 3;
  }
  // Ajuste técnico: Start + End studs usually means +1 in sequence, 
  // but following strict prompt: "montantes = comprimento / espaçamento"
  
  // 5. Parafusos
  // 25 por m² de chapa
  const screwsPlate = Math.ceil(areaUtil * 25);
  
  // 5 por metro de estrutura
  // Estrutura estimada = Guias + (Montantes * Altura)
  const structureLinearMeters = guidesLinear + (studsCount * height);
  const screwsStructure = Math.ceil(structureLinearMeters * 5);

  // 6. Fita: igual área de chapa (Referência para cálculo de consumo)
  const tape = areaUtil;

  // 7. Massa: igual área de chapa (Referência para cálculo de consumo)
  const compound = areaUtil;

  // 8. Lã de vidro: rolo com 10 m²
  const woolRolls = hasWool ? Math.ceil(areaUtil / 10) : 0;

  // 9. Mão de obra
  const laborCost = areaUtil * laborPrice;

  return {
    areaTotal,
    areaUtil,
    platesCount,
    guidesLinear,
    guidesPieces,
    studsCount,
    screwsPlate,
    screwsStructure,
    tape,
    compound,
    woolRolls,
    laborCost
  };
};
