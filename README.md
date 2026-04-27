# Alpha Insights - Alpha Trainer (Elite Version)

Sistema avançado de avaliação física e insights de treinamento desenvolvido com Next.js 15, Tailwind CSS e Shadcn UI. Projetado para profissionais que exigem precisão científica, agilidade técnica e relatórios de alta fidelidade.

## 🚀 Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## ✨ Funcionalidades de Elite Implementadas

### 1. Gestão Centralizada de Alunos
- **Listagem Profissional**: Painel dedicado para controle de alunos ativos com busca em tempo real.
- **Contexto Global**: Seleção de aluno unificada. Ao selecionar um aluno, todo o ecossistema (Dashboard, Bio, Postural, VO2) sincroniza automaticamente.

### 2. Dashboard de Avaliação Física (Protocolo ISAK & Rocha)
- **Fracionamento de 4 Componentes**: Cálculos científicos de Massa Gorda, Massa Muscular, Massa Óssea (Rocha, 1975) e Massa Residual (Würch, 1974).
- **Indicadores de Saúde em Tempo Real**: 
    - **Soma de Dobras**: Total acumulado conforme o protocolo selecionado.
    - **RCE (Relação Cintura-Estatura)**: Classificação de risco cardiometabólico.
    - **RCQ (Relação Cintura-Quadril)**: Avaliação de gordura visceral por gênero.
    - **Densidade Óssea**: Classificação automática (Baixa, Normal, Robusta).
    - **Simetria Corporal**: Mapeamento de assimetrias entre membros (Braços e Coxas).

### 3. Aptidão Física e Testes Funcionais
- **Galeria Técnica de Alta Fidelidade**: Registro com imagens de referência técnica para:
    - **Flexão de Braço**: Resistência de membros superiores.
    - **Abdominal em 1 Minuto**: Resistência do core.
    - **Handgrip (Dinamometria)**: Força de preensão manual (kgf).
    - **Banco de Wells**: Flexibilidade de cadeia posterior (cm).
- **Motor de Classificação**: Enquadramento automático em tabelas normativas com cálculo de percentil e descrição técnica.

### 4. Fisiologia do Exercício e VO2max (Elite)
- **Motor Cardiovascular Avançado**:
    - **FC Máxima**: Cálculo via fórmula de Tanaka (2001): `208 - (0.7 x idade)`.
    - **Zonas de Karvonen**: Prescrição de treinamento baseada na Frequência Cardíaca de Reserva (Z1 a Z5).
    - **Zonas de Pace**: Tradução automática de intensidade para ritmo de corrida (min/km).
- **Múltiplos Protocolos**: Cooper (12 min), Balke, 3km, 5km, Step Test e Ciclismo (Watts).
- **Teste de Conconi**: Detecção automática do Limiar Anaeróbico via ponto de deflexão da FC com gráfico interativo.

### 5. Bioimpedância Sincronizada
- **Análise Segmentar**: Suporte para balanças Omron e InBody com mapeamento de tecidos por segmento corporal e análise de evolução histórica.

### 6. Avaliação Postural de Alta Fidelidade
- **Análise Visual Inteligente**: Ferramentas de Zoom, Pan e Grade (Grid) para identificação precisa de desvios.
- **Laudo Muscular Automático**: Identificação instantânea de músculos encurtados/superativos e alongados/inibidos baseada nos desvios marcados.
- **Interface Otimizada**: Fluxo de preenchimento com seções expandidas por padrão e visual simétrico.

### 7. Relatórios PDF Profissionais
- **Geração de Documentos de Alta Fidelidade**: Inclui análise de composição corporal, evolução gráfica, dados brutos de perimetria/dobras e um resumo executivo de indicadores de saúde.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router & Turbopack)**
- **React 18 & Context API**
- **Tailwind CSS & Shadcn UI**
- **Recharts** (Gráficos Fisiológicos e Evolutivos)
- **jsPDF & html2canvas** (Exportação de Relatórios de Elite)

---
Desenvolvido para profissionais que buscam precisão científica, agilidade e inteligência na análise de performance esportiva.
