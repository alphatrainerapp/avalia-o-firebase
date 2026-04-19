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

### 2. Avaliação de Performance e VO2max (Elite)
- **Múltiplos Protocolos**: Suporte para Teste de Cooper (12 min), Balke, 3km, 5km, Step Test e o avançado **Teste de Conconi**.
- **Ciclismo de Elite**: Inclusão do **Teste de Potência (Bike - Watts)** com cálculo de VO2max via fórmula ACSM e análise de Watts/kg.
- **Análise Fisiológica Completa**: Medição de **Pressão Arterial de Repouso** com classificação automática (Diretrizes SBC) e cálculo de **FCT (FC de Trabalho)** via fórmula de Karvonen.
- **Teste de Conconi**: Identificação do ponto de deflexão da Frequência Cardíaca (Limiar Anaeróbico) com entrega de **Velocidade, FC e Pace**.
- **Zonas de Treinamento Customizáveis**: Editor flexível que permite ao treinador adicionar, remover e ajustar zonas de intensidade baseadas na FC de Reserva e % da vAM ou % de Potência.
- **Gráficos Fisiológicos**: Visualização da curva de FC vs Velocidade e distribuição de carga por zona.
- **Evolução de Performance**: Tabela comparativa histórica para monitorar o ganho de VO2max, velocidade, potência e saúde cardiovascular.

### 3. Bioimpedância Sincronizada
- **Integração Global**: Sincronização automática do cliente selecionado entre todas as telas via Context API.
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos e análise de evolução segmentar.

### 4. Avaliação Postural Avançada
- **Interface Mobile-First**: Carrossel otimizado com navegação por "dots" e indicadores de progresso, garantindo que a foto do cliente esteja sempre visível durante a marcação.
- **Mapeamento Muscular Automático**: Identificação de músculos possivelmente encurtados/superativos e alongados/inibidos com base nos desvios marcados.
- **Comparativo de Evolução**: Visualização lado a lado de fotos históricas para acompanhar a progressão postural do cliente.

### 5. Sincronização e UX
- **Global Context**: Persistência do cliente selecionado durante toda a sessão (Dashboard -> Bioimpedância -> Postural -> VO2max).
- **Interface Responsiva**: Menu de ações inteligente que se adapta para dispositivos móveis (Dashboard e VO2max).
- **Modo Escuro/Claro**: Compatibilidade total com temas para conforto visual do avaliador.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router & Turbopack)**
- **React 18 & Context API**
- **Tailwind CSS & Shadcn UI**
- **Lucide React** (Iconografia)
- **Recharts** (Gráficos de Composição e Performance)
- **jsPDF & html2canvas** (Geração de Documentos)

## 🏁 Como Iniciar
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`

---
Desenvolvido para profissionais que buscam precisão científica, agilidade e inteligência na análise de performance esportiva.
