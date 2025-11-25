// This file contains simplified SVG path data for muscle groups.
// The paths are not perfectly anatomically correct but are suitable for visualization.

type MuscleSvg = {
  id: string;
  name: string;
  d: string;
};

type MuscleSvgs = {
  front: MuscleSvg[];
  back: MuscleSvg[];
};

export const muscleSvgs: MuscleSvgs = {
  front: [
    { id: 'pectoralis_major_r', name: 'Peitoral Maior', d: 'M100 85 L125 95 L120 115 L100 110 Z' },
    { id: 'pectoralis_major_l', name: 'Peitoral Maior', d: 'M100 85 L75 95 L80 115 L100 110 Z' },
    { id: 'rectus_abdominis', name: 'Reto Abdominal', d: 'M90 115 H110 V150 H90 Z' },
    { id: 'obliques_r', name: 'Oblíquos', d: 'M110 115 L115 150 L110 150 Z' },
    { id: 'obliques_l', name: 'Oblíquos', d: 'M90 115 L85 150 L90 150 Z' },
    { id: 'quadriceps_r', name: 'Quadríceps', d: 'M105 160 L115 250 L105 250 Z' },
    { id: 'quadriceps_l', name: 'Quadríceps', d: 'M95 160 L85 250 L95 250 Z' },
    { id: 'adductors_r', name: 'Adutores', d: 'M105 160 L100 240 L105 240 Z' },
    { id: 'adductors_l', name: 'Adutores', d: 'M95 160 L100 240 L95 240 Z' },
    { id: 'tibialis_anterior_r', name: 'Tibial Anterior', d: 'M107 260 L112 330 L107 330 Z' },
    { id: 'tibialis_anterior_l', name: 'Tibial Anterior', d: 'M93 260 L88 330 L93 330 Z' },
    { id: 'deltoid_r', name: 'Deltoide', d: 'M125 95 L140 110 L120 115 Z' },
    { id: 'deltoid_l', name: 'Deltoide', d: 'M75 95 L60 110 L80 115 Z' },
    { id: 'biceps_r', name: 'Bíceps', d: 'M122 118 L135 150 L125 150 Z' },
    { id: 'biceps_l', name: 'Bíceps', d: 'M78 118 L65 150 L75 150 Z' },
    { id: 'iliopsoas_r', name: 'Iliopsoas', d: 'M105 150 L110 165 L105 165 Z' },
    { id: 'iliopsoas_l', name: 'Iliopsoas', d: 'M95 150 L90 165 L95 165 Z' },
    { id: 'tensor_fasciae_latae_r', name: 'Tensor da Fáscia Lata', d: 'M115 155 L120 180 L115 180 Z' },
    { id: 'tensor_fasciae_latae_l', name: 'Tensor da Fáscia Lata', d: 'M85 155 L80 180 L85 180 Z' },
    { id: 'sternocleidomastoid_r', name: 'Esternocleidomastoideo', d: 'M105 65 L110 80 L105 80 Z' },
    { id: 'sternocleidomastoid_l', name: 'Esternocleidomastoideo', d: 'M95 65 L90 80 L95 80 Z' },
    { id: 'scalenes_r', name: 'Escalenos', d: 'M110 70 L115 80 L110 80 Z' },
    { id: 'scalenes_l', name: 'Escalenos', d: 'M90 70 L85 80 L90 80 Z' },
    { id: 'suboccipitals', name: 'Suboccipitais', d: 'M95 55 H105 V60 H95 Z' },
    { id: 'serratus_anterior_r', name: 'Serrátil Anterior', d: 'M115 110 L120 130 L115 130 Z' },
    { id: 'serratus_anterior_l', name: 'Serrátil Anterior', d: 'M85 110 L80 130 L85 130 Z' },
    { id: 'fibularis_r', name: 'Fibulares', d: 'M112 280 L117 320 L112 320 Z' },
    { id: 'fibularis_l', name: 'Fibulares', d: 'M88 280 L83 320 L88 320 Z' },
  ],
  back: [
    { id: 'trapezius_upper_r', name: 'Trapézio Superior', d: 'M100 65 L120 85 L100 85 Z' },
    { id: 'trapezius_upper_l', name: 'Trapézio Superior', d: 'M100 65 L80 85 L100 85 Z' },
    { id: 'trapezius_middle_r', name: 'Trapézio Médio', d: 'M100 85 L115 100 L100 110 Z' },
    { id: 'trapezius_middle_l', name: 'Trapézio Médio', d: 'M100 85 L85 100 L100 110 Z' },
    { id: 'trapezius_lower_r', name: 'Trapézio Inferior', d: 'M100 110 L110 130 L100 130 Z' },
    { id: 'trapezius_lower_l', name: 'Trapézio Inferior', d: 'M100 110 L90 130 L100 130 Z' },
    { id: 'latissimus_dorsi_r', name: 'Latíssimo do Dorso', d: 'M105 100 L125 140 L110 145 L105 130 Z' },
    { id: 'latissimus_dorsi_l', name: 'Latíssimo do Dorso', d: 'M95 100 L75 140 L90 145 L95 130 Z' },
    { id: 'erector_spinae', name: 'Eretores da Espinha', d: 'M95 90 H105 V150 H95 Z' },
    { id: 'gluteus_maximus_r', name: 'Glúteo Máximo', d: 'M100 150 L115 170 L100 175 Z' },
    { id: 'gluteus_maximus_l', name: 'Glúteo Máximo', d: 'M100 150 L85 170 L100 175 Z' },
    { id: 'gluteus_medius_r', name: 'Glúteo Médio', d: 'M110 145 L120 165 L110 165 Z' },
    { id: 'gluteus_medius_l', name: 'Glúteo Médio', d: 'M90 145 L80 165 L90 165 Z' },
    { id: 'hamstrings_r', name: 'Isquiotibiais', d: 'M105 180 L115 250 L105 250 Z' },
    { id: 'hamstrings_l', name: 'Isquiotibiais', d: 'M95 180 L85 250 L95 250 Z' },
    { id: 'gastrocnemius_r', name: 'Gastrocnêmio', d: 'M107 260 L115 320 L105 320 Z' },
    { id: 'gastrocnemius_l', name: 'Gastrocnêmio', d: 'M93 260 L85 320 L95 320 Z' },
    { id: 'deltoid_posterior_r', name: 'Deltoide', d: 'M120 85 L135 105 L115 100 Z' },
    { id: 'deltoid_posterior_l', name: 'Deltoide', d: 'M80 85 L65 105 L85 100 Z' },
    { id: 'triceps_r', name: 'Tríceps', d: 'M122 110 L135 140 L125 140 Z' },
    { id: 'triceps_l', name: 'Tríceps', d: 'M78 110 L65 140 L75 140 Z' },
    { id: 'rhomboids_r', name: 'Romboides', d: 'M100 90 L105 105 L100 105 Z' },
    { id: 'rhomboids_l', name: 'Romboides', d: 'M100 90 L95 105 L100 105 Z' },
    { id: 'levator_scapulae_r', name: 'Elevador da Escápula', d: 'M105 70 L110 85 L105 85 Z' },
    { id: 'levator_scapulae_l', name: 'Elevador da Escápula', d: 'M95 70 L90 85 L95 85 Z' },
    { id: 'quadratus_lumborum_r', name: 'Quadrado Lombar', d: 'M105 135 L110 150 L105 150 Z' },
    { id: 'quadratus_lumborum_l', name: 'Quadrado Lombar', d: 'M95 135 L90 150 L95 150 Z' },
    { id: 'tibialis_posterior_r', name: 'Tibial Posterior', d: 'M106 280 L111 320 L106 320 Z' },
    { id: 'tibialis_posterior_l', name: 'Tibial Posterior', d: 'M94 280 L89 320 L94 320 Z' },
  ],
};
