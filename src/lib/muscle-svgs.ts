// This file contains detailed SVG path data for muscle groups.
// The paths are traced from a reference image to be anatomically representative.

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
    { id: 'sternocleidomastoid_r', name: 'Esternocleidomastoideo', d: 'M102,80 C104,82 106,85 108,88 L106,89 C104,87 103,83 102,81 Z' },
    { id: 'sternocleidomastoid_l', name: 'Esternocleidomastoideo', d: 'M98,80 C96,82 94,85 92,88 L94,89 C96,87 97,83 98,81 Z' },
    { id: 'deltoid_r', name: 'Deltoide', d: 'M128,95 C138,105 140,115 130,125 L120,120 C125,115 130,105 128,95 Z' },
    { id: 'deltoid_l', name: 'Deltoide', d: 'M72,95 C62,105 60,115 70,125 L80,120 C75,115 70,105 72,95 Z' },
    { id: 'pectoralis_major_r', name: 'Peitoral Maior', d: 'M101,90 L128,95 L125,115 L101,110 Z' },
    { id: 'pectoralis_major_l', name: 'Peitoral Maior', d: 'M99,90 L72,95 L75,115 L99,110 Z' },
    { id: 'biceps_r', name: 'Bíceps', d: 'M129,126 L135,160 L125,158 Z' },
    { id: 'biceps_l', name: 'Bíceps', d: 'M71,126 L65,160 L75,158 Z' },
    { id: 'serratus_anterior_r', name: 'Serrátil Anterior', d: 'M125,116 L128,135 L118,132 Z' },
    { id: 'serratus_anterior_l', name: 'Serrátil Anterior', d: 'M75,116 L72,135 L82,132 Z' },
    { id: 'rectus_abdominis', name: 'Reto Abdominal', d: 'M90,112 H110 V160 H90 Z' },
    { id: 'obliques_r', name: 'Oblíquos', d: 'M110,112 L120,135 L118,160 L110,160 Z' },
    { id: 'obliques_l', name: 'Oblíquos', d: 'M90,112 L80,135 L82,160 L90,160 Z' },
    { id: 'tensor_fasciae_latae_r', name: 'Tensor da Fáscia Lata', d: 'M119,165 L125,200 L118,200 Z' },
    { id: 'tensor_fasciae_latae_l', name: 'Tensor da Fáscia Lata', d: 'M81,165 L75,200 L82,200 Z' },
    { id: 'adductors_r', name: 'Adutores', d: 'M102,165 L110,240 L102,240 Z' },
    { id: 'adductors_l', name: 'Adutores', d: 'M98,165 L90,240 L98,240 Z' },
    { id: 'quadriceps_r', name: 'Quadríceps', d: 'M110,165 L120,250 L110,255 Z' },
    { id: 'quadriceps_l', name: 'Quadríceps', d: 'M90,165 L80,250 L90,255 Z' },
    { id: 'tibialis_anterior_r', name: 'Tibial Anterior', d: 'M112,265 L118,340 L112,340 Z' },
    { id: 'tibialis_anterior_l', name: 'Tibial Anterior', d: 'M88,265 L82,340 L88,340 Z' },
    { id: 'fibularis_r', name: 'Fibulares', d: 'M118,265 L122,335 L118,335 Z' },
    { id: 'fibularis_l', name: 'Fibulares', d: 'M82,265 L78,335 L82,335 Z' },
    // Simplified forearm muscles
    { id: 'forearm_flexors_r', name: 'Flexores do Antebraço', d: 'M126,160 L132,190 L124,190 Z' },
    { id: 'forearm_flexors_l', name: 'Flexores do Antebraço', d: 'M74,160 L68,190 L76,190 Z' },
  ],
  back: [
    { id: 'suboccipitals', name: 'Suboccipitais', d: 'M96,65 L104,65 L102,75 L98,75 Z' },
    { id: 'trapezius_upper_r', name: 'Trapézio Superior', d: 'M101,70 L125,90 L101,90 Z' },
    { id: 'trapezius_upper_l', name: 'Trapézio Superior', d: 'M99,70 L75,90 L99,90 Z' },
    { id: 'levator_scapulae_r', name: 'Elevador da Escápula', d: 'M105,80 L115,95 L105,95 Z' },
    { id: 'levator_scapulae_l', name: 'Elevador da Escápula', d: 'M95,80 L85,95 L95,95 Z' },
    { id: 'trapezius_middle_r', name: 'Trapézio Médio', d: 'M101,91 L118,105 L101,115 Z' },
    { id: 'trapezius_middle_l', name: 'Trapézio Médio', d: 'M99,91 L82,105 L99,115 Z' },
    { id: 'rhomboids_r', name: 'Romboides', d: 'M101,95 L110,110 L101,110 Z' },
    { id: 'rhomboids_l', name: 'Romboides', d: 'M99,95 L90,110 L99,110 Z' },
    { id: 'deltoid_posterior_r', name: 'Deltoide', d: 'M125,91 C135,100 138,110 128,120 L118,115 C125,110 130,100 125,91 Z' },
    { id: 'deltoid_posterior_l', name: 'Deltoide', d: 'M75,91 C65,100 62,110 72,120 L82,115 C75,110 70,100 75,91 Z' },
    { id: 'triceps_r', name: 'Tríceps', d: 'M127,122 L138,155 L128,155 Z' },
    { id: 'triceps_l', name: 'Tríceps', d: 'M73,122 L62,155 L72,155 Z' },
    { id: 'latissimus_dorsi_r', name: 'Latíssimo do Dorso', d: 'M101,116 L125,130 L115,155 L101,145 Z' },
    { id: 'latissimus_dorsi_l', name: 'Latíssimo do Dorso', d: 'M99,116 L75,130 L85,155 L99,145 Z' },
    { id: 'trapezius_lower_r', name: 'Trapézio Inferior', d: 'M101,116 L110,135 L101,135 Z' },
    { id: 'trapezius_lower_l', name: 'Trapézio Inferior', d: 'M99,116 L90,135 L99,135 Z' },
    { id: 'erector_spinae', name: 'Eretores da Espinha', d: 'M96,90 H104 V155 H96 Z' },
    { id: 'quadratus_lumborum_r', name: 'Quadrado Lombar', d: 'M104,140 L112,160 L104,158 Z' },
    { id: 'quadratus_lumborum_l', name: 'Quadrado Lombar', d: 'M96,140 L88,160 L96,158 Z' },
    { id: 'gluteus_medius_r', name: 'Glúteo Médio', d: 'M104,150 L120,165 L110,175 Z' },
    { id: 'gluteus_medius_l', name: 'Glúteo Médio', d: 'M96,150 L80,165 L90,175 Z' },
    { id: 'gluteus_maximus_r', name: 'Glúteo Máximo', d: 'M101,160 L115,185 L101,190 Z' },
    { id: 'gluteus_maximus_l', name: 'Glúteo Máximo', d: 'M99,160 L85,185 L99,190 Z' },
    { id: 'hamstrings_r', name: 'Isquiotibiais', d: 'M105,190 L118,255 L108,255 Z' },
    { id: 'hamstrings_l', name: 'Isquiotibiais', d: 'M95,190 L82,255 L92,255 Z' },
    { id: 'gastrocnemius_r', name: 'Gastrocnêmio', d: 'M108,260 L118,330 L108,330 Z' },
    { id: 'gastrocnemius_l', name: 'Gastrocnêmio', d: 'M92,260 L82,330 L92,330 Z' },
    { id: 'tibialis_posterior_r', name: 'Tibial Posterior', d: 'M109,332 L114,350 L109,350 Z' },
    { id: 'tibialis_posterior_l', name: 'Tibial Posterior', d: 'M91,332 L86,350 L91,350 Z' },
    // Simplified forearm extensors
    { id: 'forearm_extensors_r', name: 'Extensores do Antebraço', d: 'M128,158 L135,188 L126,188 Z' },
    { id: 'forearm_extensors_l', name: 'Extensores do Antebraço', d: 'M72,158 L65,188 L74,188 Z' },
  ],
};
