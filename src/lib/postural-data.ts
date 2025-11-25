export const posturalDeviations = {
  anterior: [
    {
      title: 'Cabeça',
      items: [
        { subtitle: 'Inclinação', options: ['Cabeça inclinada'] },
        { subtitle: 'Rotação', options: ['Cabeça rodada'] }
      ]
    },
    {
      title: 'Ombros',
      items: [
        { subtitle: 'Altura', options: ['Ombro elevado', 'Ombro baixo'] },
        { subtitle: 'Posição', options: ['Escápula abduzida', 'Escápula aduzida'] }
      ]
    },
    {
      title: 'Quadril',
      items: [
        { subtitle: 'Altura', options: ['Quadril alto', 'Quadril baixo'] }
      ]
    },
    {
      title: 'Joelhos',
      items: [
        { subtitle: 'Alinhamento', options: ['Geno valgo', 'Geno varo'] }
      ]
    },
    {
      title: 'Pés',
      items: [
        { subtitle: 'Tipo de Pé', options: ['Pé pronado', 'Pé supinado'] }
      ]
    }
  ],
  posterior: [
    {
      title: 'Ombros',
      items: [
        { subtitle: 'Altura', options: ['Ombro direito alto', 'Ombro esquerdo alto'] },
        { subtitle: 'Escápula', options: ['Escápula alada D', 'Escápula alada E', 'Rotação escapular D/E', 'Basculamento escapular'] },
        { subtitle: 'Cintura Escapular', options: ['Cintura escapular desviada D/E'] }
      ]
    },
    {
      title: 'Coluna',
      items: [
        { subtitle: 'Escoliose', options: ['Escoliose C direita', 'Escoliose C esquerda', 'Escoliose S'] },
        { subtitle: 'Tronco', options: ['Tronco desviado D/E', 'Rotação do tronco D/E', 'Inclinação do tronco D/E'] }
      ]
    },
    {
      title: 'Pelve',
      items: [
        { subtitle: 'Altura', options: ['Quadril direito alto', 'Quadril esquerdo alto'] },
        { subtitle: 'Posição', options: ['Pelve desviada D/E', 'Rotação pélvica D/E'] }
      ]
    },
    {
      title: 'Joelhos',
      items: [
        { subtitle: 'Alinhamento', options: ['Valgo', 'Varo'] },
        { subtitle: 'Torção Tibial', options: ['Torção tibial interna', 'Torção tibial externa'] }
      ]
    },
    {
      title: 'Pés',
      items: [
        { subtitle: 'Tipo de Pé', options: ['Pé pronado direito/esquerdo', 'Pé supinado direito/esquerdo'] },
        { subtitle: 'Tendão de Aquiles', options: ['Tendão de Aquiles em valgo/varo'] }
      ]
    }
  ],
  lateral_direita: [
    {
      title: 'Cabeça e Cervical',
      items: [
        { options: ['Cabeça projetada', 'Cabeça recuada', 'Cervical em hiperextensão', 'Cervical retificada'] }
      ]
    },
    {
      title: 'Ombros',
      items: [
        { options: ['Ombro protraído', 'Ombro retraído'] }
      ]
    },
    {
      title: 'Coluna Torácica',
      items: [
        { options: ['Hipercifose torácica', 'Retificação torácica'] }
      ]
    },
    {
      title: 'Coluna Lombar',
      items: [
        { options: ['Lordose lombar aumentada', 'Retificação lombar'] }
      ]
    },
    {
      title: 'Pelve',
      items: [
        { options: ['Pelve em anteversão', 'Pelve em retroversão'] }
      ]
    },
    {
      title: 'Tronco',
      items: [
        { options: ['Tronco inclinado para frente', 'Tronco inclinado para trás'] }
      ]
    },
    {
      title: 'Joelhos',
      items: [
        { options: ['Joelho hiperestendido', 'Joelho em flexo'] }
      ]
    },
    {
      title: 'Pés',
      items: [
        { options: ['Pé pronado (lateral)', 'Pé supinado (lateral)'] }
      ]
    }
  ],
  lateral_esquerda: [
    {
      title: 'Cabeça e Cervical',
      items: [
        { options: ['Cabeça projetada', 'Cabeça recuada', 'Cervical em hiperextensão', 'Cervical retificada'] }
      ]
    },
    {
      title: 'Ombros',
      items: [
        { options: ['Ombro protraído', 'Ombro retraído'] }
      ]
    },
    {
      title: 'Coluna Torácica',
      items: [
        { options: ['Hipercifose torácica', 'Retificação torácica'] }
      ]
    },
    {
      title: 'Coluna Lombar',
      items: [
        { options: ['Lordose lombar aumentada', 'Retificação lombar'] }
      ]
    },
    {
      title: 'Pelve',
      items: [
        { options: ['Pelve em anteversão', 'Pelve em retroversão'] }
      ]
    },
    {
      title: 'Joelhos',
      items: [
        { options: ['Joelho flexionado'] }
      ]
    },
    {
      title: 'Pés',
      items: [
        { options: ['Pé supinado (lateral)'] }
      ]
    }
  ]
};

export const muscleMappings: { [key: string]: { encurtados: string[], alongados: string[] } } = {
  'Cabeça inclinada': { 'encurtados': ['Esternocleidomastoideo unilateral', 'Trapézio superior unilateral', 'Escalenos'], 'alongados': ['Esternocleidomastoideo contralateral', 'Trapézio médio e inferior contralateral'] },
  'Cabeça rodada': { 'encurtados': ['Esternocleidomastoideo', 'Esplenio da cabeça', 'Trapézio superior'], 'alongados': ['Esternocleidomastoideo contralateral', 'Esplenio contralateral'] },
  'Ombro elevado': { 'encurtados': ['Trapézio superior', 'Elevador da escápula'], 'alongados': ['Trapézio inferior', 'Serrátil anterior'] },
  'Ombro baixo': { 'encurtados': ['Latíssimo do dorso', 'Peitoral menor'], 'alongados': ['Trapézio superior', 'Elevador da escápula'] },
  'Escápula abduzida': { 'encurtados': ['Serrátil anterior', 'Peitoral menor'], 'alongados': ['Romboides', 'Trapézio médio'] },
  'Escápula aduzida': { 'encurtados': ['Romboides', 'Trapézio médio'], 'alongados': ['Serrátil anterior', 'Peitoral menor'] },
  'Quadril alto': { 'encurtados': ['Quadrado lombar', 'Oblíquos'], 'alongados': ['Adutores contralaterais', 'Glúteo médio contralateral'] },
  'Quadril baixo': { 'encurtados': ['Adutores', 'Glúteo médio contralateral'], 'alongados': ['Quadrado lombar contralateral', 'Oblíquos'] },
  'Geno valgo': { 'encurtados': ['Adutores', 'Tensor da fáscia lata'], 'alongados': ['Glúteo médio e mínimo', 'Rotadores laterais do quadril'] },
  'Geno varo': { 'encurtados': ['Glúteo médio', 'TFL'], 'alongados': ['Adutores'] },
  'Pé pronado': { 'encurtados': ['Fibulares', 'Gastrocnêmio medial'], 'alongados': ['Tibial posterior', 'Flexores plantares'] },
  'Pé supinado': { 'encurtados': ['Tibial posterior', 'Flexores plantares'], 'alongados': ['Fibulares'] },
  'Escápula alada': { 'encurtados': ['Romboides', 'Peitoral menor'], 'alongados': ['Serrátil anterior'] },
  'Quadril elevado': { 'encurtados': ['Quadrado lombar', 'Eretores da espinha'], 'alongados': ['Glúteo médio', 'Adutores contralaterais'] },
  'Pelve em rotação': { 'encurtados': ['Oblíquos internos de um lado', 'Oblíquos externos do outro'], 'alongados': ['Rotadores contralaterais'] },
  'Joelho em rotação interna': { 'encurtados': ['TFL', 'Vasto lateral'], 'alongados': ['Rotadores laterais do quadril'] },
  'Joelho em rotação externa': { 'encurtados': ['Rotadores externos do quadril'], 'alongados': ['TFL', 'Adutores'] },
  'Cabeça projetada': { 'encurtados': ['Esternocleidomastoideo', 'Suboccipitais'], 'alongados': ['Flexores profundos cervicais'] },
  'Cifose torácica': { 'encurtados': ['Peitoral maior e menor'], 'alongados': ['Eretores da espinha torácica', 'Romboides'] },
  'Hipercifose torácica': { 'encurtados': ['Peitoral maior e menor'], 'alongados': ['Eretores da espinha torácica', 'Romboides'] },
  'Lordose lombar aumentada': { 'encurtados': ['Iliopsoas', 'Reto femoral', 'Eretores da espinha'], 'alongados': ['Glúteo máximo', 'Abdominais'] },
  'Retificação lombar': { 'encurtados': ['Abdominais profundos', 'Abdominais'], 'alongados': ['Eretores da espinha'] },
  'Pelve em anteversão': { 'encurtados': ['Iliopsoas', 'Reto femoral'], 'alongados': ['Isquiotibiais', 'Glúteos', 'Glúteo máximo'] },
  'Pelve em retroversão': { 'encurtados': ['Isquiotibiais'], 'alongados': ['Iliopsoas', 'Eretores da espinha'] },
  'Joelho hiperestendido': { 'encurtados': ['Quadríceps', 'Gastrocnêmio'], 'alongados': ['Isquiotibiais'] },
  'Joelho flexionado': { 'encurtados': ['Isquiotibiais'], 'alongados': ['Quadríceps'] },
  'Pé pronado (lateral)': { 'encurtados': ['Fibulares'], 'alongados': ['Tibial posterior'] },
  'Pé supinado (lateral)': { 'encurtados': ['Tibial posterior'], 'alongados': ['Fibulares'] },
};
