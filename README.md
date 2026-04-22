# Alpha Insights - Alpha Trainer

Sistema avançado de avaliação física e insights de treinamento desenvolvido com Next.js 15, Tailwind CSS e Shadcn UI.

## 🚀 Repositório Oficial
Este projeto está hospedado no GitHub: [alphatrainerapp/avalia-o-firebase](https://github.com/alphatrainerapp/avalia-o-firebase)

## ✨ Funcionalidades Implementadas

### 1. Gestão Centralizada de Alunos
- **Listagem Profissional**: Painel dedicado para controle de alunos ativos com busca em tempo real.
- **Contexto Global**: Seleção de aluno unificada. Ao selecionar um aluno na lista, todo o sistema (Dashboard, Bio, Postural, VO2) sincroniza automaticamente com os dados dele.
- **Navegação Inteligente**: Sidebar (menu lateral) colapsável por padrão para maximizar a área útil de trabalho.

### 2. Dashboard de Avaliação Física (Protocolo ISAK)
- **Fracionamento de 4 Componentes**: Cálculos científicos de Massa Gorda, Massa Muscular, Massa Óssea (Rocha, 1975) e Massa Residual (Würch, 1974).
- **Indicadores de Saúde**: Inclusão do **RCE (Relação Cintura-Estatura)** com classificação de risco cardiometabólico, além de IMC e RCQ.
- **Protocolo ISAK**: Suporte completo ao perfil de 8 dobras e 3 diâmetros ósseos (Punho, Fêmur e Úmero) para máxima precisão.
- **Relatórios em PDF**: Exportação de relatórios profissionais com gráficos de composição corporal e tabelas comparativas.

### 3. Fisiologia do Exercício e VO2max (Elite)
- **Motor Cardiovascular Avançado**:
    - **FC Máxima**: Cálculo automático via fórmula de Tanaka (2001): `208 - (0.7 x idade)`.
    - **FC de Reserva**: Identificação da capacidade de adaptação cardiovascular.
    - **Zonas de Karvonen**: Prescrição de treinamento baseada na Frequência Cardíaca de Reserva (Z1 a Z5).
- **Múltiplos Protocolos**: Suporte para Teste de Cooper (12 min), Balke, 3km, 5km, Step Test e Ciclismo (Watts).
- **Teste de Conconi**: Registro de estágios progressivos com gráfico de curva de FC e detecção automática do Limiar Anaeróbico.
- **Régua de Performance**: Visualização intuitiva do nível de condicionamento do atleta comparado a tabelas normativas.

### 4. Bioimpedância Sincronizada
- **Múltiplos Equipamentos**: Suporte para balanças Omron e InBody com campos específicos e análise de evolução segmentar.
- **Histórico Comparativo**: Gráficos de tendência de peso, massa gorda e muscular.

### 5. Avaliação Postural Avançada
- **Interface Mobile-First**: Carrossel otimizado para marcação de desvios diretamente no celular.
- **Mapeamento Muscular**: Identificação automática de músculos encurtados/superativos e alongados/inibidos.

## 🛠️ Tecnologias Utilizadas
- **Next.js 15 (App Router & Turbopack)**
- **React 18 & Context API**
- **Tailwind CSS & Shadcn UI**
- **Lucide React** (Iconografia)
- **Recharts** (Gráficos Fisiológicos)
- **jsPDF & html2canvas** (Geração de Documentos)

## 🏁 Como Iniciar
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`

---
Desenvolvido para profissionais que buscam precisão científica, agilidade e inteligência na análise de performance esportiva.