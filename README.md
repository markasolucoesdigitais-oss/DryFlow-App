# DRYFLOW

Calculadora de obras sem enrolação para instaladores.

## Como fazer Deploy na Vercel

1. **Push para o GitHub**
   - Crie um repositório no GitHub.
   - Suba estes arquivos.

2. **Vercel**
   - Crie uma conta na [Vercel](https://vercel.com).
   - Clique em "Add New Project".
   - Importe seu repositório do GitHub.

3. **Configuração**
   - Framework Preset: Create React App (ou Vite, se migrar).
   - **Environment Variables**:
     - `API_KEY`: Sua chave da API do Google Gemini.

4. **Deploy**
   - Clique em "Deploy".
   - Aguarde finalizar.

## Stack
- React (SPA)
- Tailwind CSS (via CDN ou PostCSS)
- Google Gemini SDK (Dicas de Mestre)
