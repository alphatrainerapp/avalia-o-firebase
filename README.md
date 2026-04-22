# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento desenvolvido com Next.js 15, Tailwind CSS e Shadcn UI.

## 🚀 Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## ✨ Funcionalidades Implementadas

### 1. Gestão Centralizada de Alunos
- **Listagem Profissional**: Painel dedicado para controle de alunos ativos com busca em tempo real.
- **Contexto Global**: Seleção de aluno unificada. Ao selecionar um aluno na lista, todo o sistema (Dashboard, Bio, Postural, VO2) sincroniza automaticamente com os dados dele.

### 2. Dashboard de Avaliação Física (Protocolo ISAK)
- **Fracionamento de 4 Componentes**: Cálculos científicos de Massa Gorda, Massa Muscular, Massa Óssea (Rocha, 1975) e Massa Residual (Würch, 1974).
- **Indicadores de Saúde**: Inclusão do **RCE (Relação Cintura-Estatura)** com classificação de risco cardiometabólico, além de IMC e RCQ.
- **Protocolo ISAK**: Suporte completo ao perfil de 8 dobras e 3 diâmetros ósseos (Punho, Fêmur e Úmero).

### 3. Aptidão Física e Testes Funcionais 🆕
- **Bateria de Testes**: Registro técnico com imagens de referência para:
    - **Flexão de Braço**: Resistência de membros superiores.
    - **Abdominal em 1 Minuto**: Resistência do core.
    - **Handgrip (Dinamometria)**: Força de preensão manual (kgf).
    - **Banco de Wells**: Flexibilidade de cadeia posterior (cm).
- **Motor de Classificação**: Enquadramento automático em tabelas normativas (Excelente a Muito Fraco) com cálculo de percentil.

### 4. Fisiologia do Exercício e VO2max (Elite)
- **Motor Cardiovascular Avançado**:
    - **FC Máxima**: Cálculo automático via fórmula de Tanaka (2001): `208 - (0.7 x idade)`.
    - **FC de Reserva**: Identificação da capacidade de adaptação cardiovascular.
    - **Zonas de Karvonen**: Prescrição de treinamento baseada na Frequência Cardíaca de Reserva (Z1 a Z5) com visualização em barras de progresso.
- **Múltiplos Protocolos**: Suporte para Teste de Cooper (12 min), Balke, 3km, 5km, Step Test e Ciclismo (Watts).
- **Teste de Conconi**: Registro de estágios progressivos com gráfico de curva de FC e detecção automática do Limiar Anaeróbico.

### 5. Bioimpedância Sincronizada
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos e análise de evolução segmentar.

### 6. Avaliação Postural Avançada
- **Interface Mobile-First**: Carrossel otimizado para marcação de desvios diretamente no celular.
- **Mapeamento Muscular**: Identificação automática de músculos encurtados/superativos e alongados/inibidos.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router & Turbopack)**
- **React 18 & Context API**
- **Tailwind CSS & Shadcn UI**
- **Recharts** (Gráficos Fisiológicos e Evolutivos)
- **jsPDF & html2canvas** (Geração de Documentos Profissionais)

---
Desenvolvido para profissionais que buscam precisão científica, agilidade e inteligência na análise de performance esportiva.
