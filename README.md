
# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento.

## Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## Funcionalidades Implementadas

### 1. Dashboard de Avaliação Física
- **Gestão Centralizada**: Criação e acompanhamento de avaliações físicas com numeração automática e datas locais precisas.
- **Protocolos de Dobras**: Suporte a diversos protocolos, incluindo o padrão internacional **ISAK (8 dobras)**.
- **Cálculos Automáticos**: IMC, RCQ, densidade corporal e composição de massas baseada em protocolos científicos.
- **Relatórios em PDF**: Geração de relatórios profissionais utilizando `jspdf` e `html2canvas`.

### 2. Bioimpedância Sincronizada
- **Integração Global**: Sincronização automática entre as telas de avaliação.
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos.
- **Análise Segmentar**: Visualização de massa magra e gorda por segmento corporal.

### 3. Avaliação Postural
- **Análise Fotográfica**: Upload e análise de fotos em 4 vistas com grid de alinhamento e zoom.
- **Mapeamento Muscular**: Identificação de desvios e sugestões de músculos encurtados/alongados.

### 4. Sincronização de Dados
- **Global Context**: Uso de React Context para manter os dados de clientes e avaliações consistentes em toda a navegação.
- **Tratamento de Datas**: Lógica robusta para evitar problemas de fuso horário em novos registros.

## Tecnologias Utilizadas
- **Next.js 15 (App Router)**
- **React 18**
- **Tailwind CSS & Shadcn UI**
- **Lucide React (Ícones)**
- **Recharts (Gráficos)**
- **jsPDF & html2canvas (Relatórios PDF)**
