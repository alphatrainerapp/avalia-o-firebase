# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento desenvolvido com Next.js 15, Tailwind CSS e Shadcn UI.

## 🚀 Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## ✨ Funcionalidades Implementadas

### 1. Dashboard de Avaliação Física (Protocolo ISAK)
- **Fracionamento de 4 Componentes**: Cálculos científicos de Massa Gorda, Massa Muscular, Massa Óssea (Rocha, 1975) e Massa Residual (Würch, 1974).
- **Protocolo ISAK**: Suporte completo ao perfil de 8 dobras e 3 diâmetros ósseos (Punho, Fêmur e Úmero) para máxima precisão.
- **Estado Zero Inteligente**: Interface adaptativa que simplifica o início para novos clientes e expande conforme o histórico é criado.
- **Relatórios em PDF**: Exportação de relatórios profissionais com gráficos de composição corporal e tabelas comparativas.

### 2. Bioimpedância Sincronizada
- **Integração Global**: Sincronização automática do cliente selecionado entre todas as telas via Context API.
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos e análise de evolução segmentar.

### 3. Avaliação Postural Avançada
- **Interface Mobile-First**: Carrossel otimizado com navegação por "dots" e indicadores de progresso, garantindo que a foto do cliente esteja sempre visível.
- **Mapeamento Muscular Automático**: Identificação de músculos possivelmente encurtados/superativos e alongados/inibidos com base nos desvios marcados.
- **Comparativo de Evolução**: Visualização lado a lado de fotos históricas para acompanhar a progressão postural do cliente.
- **Ferramentas de Análise**: Grid de alinhamento dinâmico e zoom de precisão.

### 4. Sincronização e UX
- **Global Context**: Persistência do cliente selecionado e das avaliações durante toda a sessão de navegação.
- **Modo Escuro/Claro**: Interface totalmente compatível com temas claros e escuros para melhor conforto visual.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router & Turbopack)**
- **React 18 & Context API**
- **Tailwind CSS & Shadcn UI**
- **Lucide React** (Iconografia)
- **Recharts** (Gráficos de Composição e Evolução)
- **jsPDF & html2canvas** (Geração de Documentos)

## 🏁 Como Iniciar
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`

---
Desenvolvido para profissionais que buscam precisão científica e agilidade na avaliação física.
