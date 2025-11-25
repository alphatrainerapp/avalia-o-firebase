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

export const muscleMappings: { [key: string]: { shortened: string[], lengthened: string[] } } = {
  // Vista Anterior
  'Cabeça inclinada': { shortened: ['ECOM (lado da inclinação)', 'Escalenos (lado da inclinação)'], lengthened: ['ECOM (lado oposto)', 'Escalenos (lado oposto)'] },
  'Cabeça rodada': { shortened: ['ECOM (lado oposto à rotação)'], lengthened: ['ECOM (lado da rotação)'] },
  'Ombro elevado': { shortened: ['Trapézio Superior', 'Elevador da Escápula'], lengthened: [] },
  'Ombro baixo': { shortened: [], lengthened: ['Trapézio Superior'] },
  'Escápula abduzida': { shortened: ['Peitoral Maior', 'Serrátil Anterior'], lengthened: ['Romboides', 'Trapézio Médio'] },
  'Escápula aduzida': { shortened: ['Romboides', 'Trapézio Médio'], lengthened: ['Peitoral Maior', 'Serrátil Anterior'] },
  'Quadril alto': { shortened: ['Quadrado Lombar (lado do quadril alto)', 'Adutores (lado do quadril alto)'], lengthened: ['Glúteo Médio (lado do quadril baixo)'] },
  'Quadril baixo': { shortened: ['Glúteo Médio (lado do quadril baixo)'], lengthened: ['Quadrado Lombar (lado do quadril alto)', 'Adutores (lado do quadril alto)'] },
  'Geno valgo': { shortened: ['Adutores', 'Tensor da Fáscia Lata'], lengthened: ['Glúteo Médio'] },
  'Geno varo': { shortened: ['Glúteo Médio'], lengthened: ['Adutores', 'Tensor da Fáscia Lata'] },
  'Pé pronado': { shortened: ['Fibular Curto', 'Fibular Longo'], lengthened: ['Tibial Posterior'] },
  'Pé supinado': { shortened: ['Tibial Posterior'], lengthened: ['Fibular Curto', 'Fibular Longo'] },

  // Vista Posterior
  'Escápula alada D': { shortened: ['Peitoral Menor (D)'], lengthened: ['Serrátil Anterior (D)', 'Romboides (D)'] },
  'Escápula alada E': { shortened: ['Peitoral Menor (E)'], lengthened: ['Serrátil Anterior (E)', 'Romboides (E)'] },
  'Escoliose C direita': { shortened: ['Músculos do lado côncavo (esquerdo)'], lengthened: ['Músculos do lado convexo (direito)'] },
  'Escoliose C esquerda': { shortened: ['Músculos do lado côncavo (direito)'], lengthened: ['Músculos do lado convexo (esquerdo)'] },
  'Valgo': { shortened: ['Adutores', 'Tensor da Fáscia Lata'], lengthened: ['Glúteo Médio'] },
  'Varo': { shortened: ['Glúteo Médio'], lengthened: ['Adutores', 'Tensor da Fáscia Lata'] },

  // Vista Lateral
  'Cabeça projetada': { shortened: ['Extensores do pescoço (suboccipitais, trapézio superior)', 'Elevador da escápula'], lengthened: ['Flexores profundos do pescoço'] },
  'Cabeça recuada': { shortened: ['Flexores profundos do pescoço'], lengthened: ['Extensores do pescoço'] },
  'Cervical em hiperextensão': { shortened: ['Extensores do pescoço'], lengthened: ['Flexores do pescoço'] },
  'Cervical retificada': { shortened: ['Flexores do pescoço'], lengthened: ['Extensores do pescoço'] },
  'Ombro protraído': { shortened: ['Peitoral Maior', 'Peitoral Menor', 'Serrátil Anterior'], lengthened: ['Romboides', 'Trapézio Médio e Inferior'] },
  'Ombro retraído': { shortened: ['Romboides', 'Trapézio Médio'], lengthened: ['Peitoral Maior', 'Peitoral Menor'] },
  'Hipercifose torácica': { shortened: ['Peitorais', 'Intercostais'], lengthened: ['Eretores da espinha torácica', 'Romboides'] },
  'Retificação torácica': { shortened: ['Eretores da espinha torácica'], lengthened: ['Peitorais'] },
  'Lordose lombar aumentada': { shortened: ['Eretores da espinha lombar', 'Psoas', 'Iliopsoas'], lengthened: ['Abdominais', 'Glúteos'] },
  'Retificação lombar': { shortened: ['Abdominais', 'Isquiotibiais'], lengthened: ['Eretores da espinha lombar', 'Psoas'] },
  'Pelve em anteversão': { shortened: ['Flexores do quadril (Psoas, Reto Femoral)', 'Eretores da Espinha'], lengthened: ['Glúteos', 'Isquiotibiais', 'Abdominais'] },
  'Pelve em retroversão': { shortened: ['Glúteos', 'Isquiotibiais', 'Abdominais'], lengthened: ['Flexores do quadril (Psoas, Reto Femoral)', 'Eretores da Espinha'] },
  'Joelho hiperestendido': { shortened: ['Quadríceps'], lengthened: ['Isquiotibiais'] },
  'Joelho em flexo': { shortened: ['Isquiotibiais'], lengthened: ['Quadríceps'] },
  'Joelho flexionado': { shortened: ['Isquiotibiais'], lengthened: ['Quadríceps'] },
  'Pé supinado (lateral)': { shortened: ['Tibial Posterior'], lengthened: ['Fibular Longo', 'Fibular Curto'] },
  'Pé pronado (lateral)': { shortened: ['Fibular Longo', 'Fibular Curto'], lengthened: ['Tibial Posterior'] }
};
