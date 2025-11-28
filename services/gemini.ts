import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectAdvice = async (
  serviceType: string,
  subType: string,
  area: number,
  materials: string
): Promise<string> => {
  try {
    // Basic check for missing key in environment
    if (!process.env.API_KEY) {
      console.warn("API Key not found in environment variables.");
      return "Configure a API Key para receber dicas.";
    }

    const prompt = `
      Aja como um mestre de obras experiente e especialista no Brasil.
      Estou fazendo um orçamento de ${serviceType} (${subType}) com área total de ${area}m².
      Materiais previstos: ${materials}.
      
      Gere um parágrafo curto, informal mas técnico, dando uma dica de ouro para evitar prejuízo nessa obra específica e uma sugestão de argumento para fechar a venda com o cliente.
      Sem saudações, vá direto ao ponto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sem dicas do mestre hoje.";
  } catch (error) {
    console.error("Erro AI:", error);
    return "Erro ao gerar dica. Tente novamente.";
  }
};