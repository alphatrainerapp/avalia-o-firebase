# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento desenvolvido com Next.js 15, Tailwind CSS e Shadcn UI.

## 🚀 Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## ✨ Funcionalidades Implementadas

### 1. Dashboard de Avaliação Física
- **Gestão Centralizada**: Criação e acompanhamento de avaliações físicas com numeração automática.
- **Estado Zero Inteligente**: Ao iniciar um novo cliente, a interface é simplificada, expandindo-se apenas após a criação da primeira avaliação.
- **Protocolos de Dobras**: Suporte a diversos protocolos, incluindo o padrão internacional **ISAK (8 dobras)** com destaque visual das medidas obrigatórias (incluindo Panturrilha Medial e Supraespinal).
- **Cálculos em Tempo Real**: IMC, RCQ, densidade corporal e composição de massas (Gorda, Muscular, Óssea e Residual) calculados instantaneamente.
- **Relatórios em PDF**: Geração de relatórios profissionais utilizando `jspdf` e `html2canvas`.

### 2. Bioimpedância Sincronizada
- **Integração Global**: Sincronização automática entre as telas de avaliação via React Context.
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos e análise de evolução.
- **Análise Segmentar**: Visualização de massa magra e gorda por segmento corporal.

### 3. Avaliação Postural Avançada
- **Interface Mobile-First**: Carrossel otimizado para dispositivos móveis, permitindo marcar desvios sem perder a visão da foto.
- **Navegação Intuitiva**: Fluxo guiado por vistas (Frente, Costas, Lateral D/E) com botões de Próximo/Anterior.
- **Mapeamento Muscular**: Identificação automática de músculos possivelmente encurtados ou alongados com base nos desvios marcados.
- **Ferramentas de Análise**: Grid de alinhamento e zoom dinâmico para precisão diagnóstica.

### 4. Sincronização de Dados
- **Global Context**: Uso de React Context para persistência de dados durante a sessão de navegação.
- **Tratamento de Datas**: Lógica robusta para datas locais, evitando conflitos de fuso horário.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router)**
- **React 18**
- **Tailwind CSS & Shadcn UI**
- **Lucide React** (Ícones)
- **Recharts** (Gráficos de Evolução)
- **jsPDF & html2canvas** (Exportação de Relatórios)

## 🏁 Como Iniciar
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`

---
Desenvolvido para profissionais que buscam precisão e agilidade na avaliação física.
