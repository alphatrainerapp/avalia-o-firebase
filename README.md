# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento.

## Funcionalidades Implementadas

### 1. Dashboard de Avaliação Física
- **Gestão Centralizada**: Criação e acompanhamento de avaliações físicas.
- **Protocolos de Dobras**: Suporte a diversos protocolos (Pollock 3, 4 e 7 dobras, Guedes, etc.).
- **Protocolo ISAK**: Implementação completa do padrão internacional ISAK com 8 dobras destacadas.
- **Cálculos Automáticos**: IMC, RCQ, densidade corporal e composição de massas (gorda, magra, muscular, óssea e residual).
- **Relatórios em PDF**: Geração de relatórios profissionais com gráficos de evolução.

### 2. Bioimpedância Sincronizada
- **Integração Total**: Sincronização automática com as avaliações do Dashboard.
- **Múltiplos Equipamentos**: Suporte para balanças simples (Omron) e bioimpedância completa (InBody).
- **Análise Segmentar**: Visualização detalhada de massa magra e gorda por segmento corporal.

### 3. Avaliação Postural
- **Análise Fotográfica**: Upload e análise de fotos em 4 vistas (Anterior, Posterior, Lateral D/E).
- **Ferramentas de Medição**: Grade (grid) de alinhamento e zoom/pan para análise precisa.
- **Mapeamento Muscular**: Identificação automática de músculos encurtados e alongados com base nos desvios detectados.

### 4. Sincronização de Dados (Global Context)
- **Fonte Única de Verdade**: Uso de React Context para garantir que uma nova avaliação criada em qualquer tela apareça instantaneamente em todas as outras.
- **Datas Robustas**: Tratamento de fuso horário para garantir que as avaliações sempre usem a data local correta.

## Tecnologias Utilizadas
- **Next.js 15 (App Router)**
- **React 18**
- **Tailwind CSS & Shadcn UI**
- **Lucide React (Ícones)**
- **Recharts (Gráficos)**
- **jsPDF & html2canvas (Relatórios PDF)**
