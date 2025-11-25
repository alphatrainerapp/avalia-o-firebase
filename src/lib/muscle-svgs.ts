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
    { id: 'sternocleidomastoid_r', name: 'Esternocleidomastoideo', d: 'M104,78 C105,82 107,86 109,90 L107,91 C106,88 105,84 104,80 Z' },
    { id: 'sternocleidomastoid_l', name: 'Esternocleidomastoideo', d: 'M96,78 C95,82 93,86 91,90 L93,91 C94,88 95,84 96,80 Z' },
    { id: 'deltoid_r', name: 'Deltoide', d: 'M126,96 C138,102 142,112 134,124 L124,120 C130,114 132,106 126,100 Z' },
    { id: 'deltoid_l', name: 'Deltoide', d: 'M74,96 C62,102 58,112 66,124 L76,120 C70,114 68,106 74,100 Z' },
    { id: 'pectoralis_major_r', name: 'Peitoral Maior', d: 'M101,92 L126,98 L124,118 L101,112 Z' },
    { id: 'pectoralis_major_l', name: 'Peitoral Maior', d: 'M99,92 L74,98 L76,118 L99,112 Z' },
    { id: 'biceps_r', name: 'Bíceps', d: 'M133,125 C136,135 138,145 134,158 L126,155 C132,145 132,135 133,125 Z' },
    { id: 'biceps_l', name: 'Bíceps', d: 'M67,125 C64,135 62,145 66,158 L74,155 C68,145 68,135 67,125 Z' },
    { id: 'serratus_anterior_r', name: 'Serrátil Anterior', d: 'M124,120 L126,138 L116,135 Z' },
    { id: 'serratus_anterior_l', name: 'Serrátil Anterior', d: 'M76,120 L74,138 L84,135 Z' },
    { id: 'rectus_abdominis', name: 'Reto Abdominal', d: 'M92,114 H108 V162 H92 Z' },
    { id: 'obliques_r', name: 'Oblíquos', d: 'M108,114 L118,138 L116,162 L108,162 Z' },
    { id: 'obliques_l', name: 'Oblíquos', d: 'M92,114 L82,138 L84,162 L92,162 Z' },
    { id: 'tensor_fasciae_latae_r', name: 'Tensor da Fáscia Lata', d: 'M118,165 L124,205 L116,202 Z' },
    { id: 'tensor_fasciae_latae_l', name: 'Tensor da Fáscia Lata', d: 'M82,165 L76,205 L84,202 Z' },
    { id: 'adductors_r', name: 'Adutores', d: 'M103,168 L112,245 L103,245 Z' },
    { id: 'adductors_l', name: 'Adutores', d: 'M97,168 L88,245 L97,245 Z' },
    { id: 'quadriceps_r', name: 'Quadríceps', d: 'M112,168 L122,255 L112,258 Z' },
    { id: 'quadriceps_l', name: 'Quadríceps', d: 'M88,168 L78,255 L88,258 Z' },
    { id: 'tibialis_anterior_r', name: 'Tibial Anterior', d: 'M114,268 L120,345 L114,345 Z' },
    { id: 'tibialis_anterior_l', name: 'Tibial Anterior', d: 'M86,268 L80,345 L86,345 Z' },
    { id: 'fibularis_r', name: 'Fibulares', d: 'M120,268 L124,340 L120,340 Z' },
    { id: 'fibularis_l', name: 'Fibulares', d: 'M80,268 L76,340 L80,340 Z' },
    { id: 'forearm_flexors_r', name: 'Flexores do Antebraço', d: 'M128,160 L134,192 L126,190 Z' },
    { id: 'forearm_flexors_l', name: 'Flexores do Antebraço', d: 'M72,160 L66,192 L74,190 Z' },
  ],
  back: [
    { id: 'suboccipitals', name: 'Suboccipitais', d: 'M97,68 L103,68 L101,76 L99,76 Z' },
    { id: 'trapezius_upper_r', name: 'Trapézio Superior', d: 'M101,72 L124,92 L101,92 Z' },
    { id: 'trapezius_upper_l', name: 'Trapézio Superior', d: 'M99,72 L76,92 L99,92 Z' },
    { id: 'levator_scapulae_r', name: 'Elevador da Escápula', d: 'M106,82 L116,97 L106,97 Z' },
    { id: 'levator_scapulae_l', name: 'Elevador da Escápula', d: 'M94,82 L84,97 L94,97 Z' },
    { id: 'trapezius_middle_r', name: 'Trapézio Médio', d: 'M101,93 L117,107 L101,117 Z' },
    { id: 'trapezius_middle_l', name: 'Trapézio Médio', d: 'M99,93 L83,107 L99,117 Z' },
    { id: 'rhomboids_r', name: 'Romboides', d: 'M101,97 L109,112 L101,112 Z' },
    { id: 'rhomboids_l', name: 'Romboides', d: 'M99,97 L91,112 L99,112 Z' },
    { id: 'deltoid_posterior_r', name: 'Deltoide', d: 'M124,93 C134,102 136,112 126,122 L117,117 C124,112 128,102 124,93 Z' },
    { id: 'deltoid_posterior_l', name: 'Deltoide', d: 'M76,93 C66,102 64,112 74,122 L83,117 C76,112 72,102 76,93 Z' },
    { id: 'triceps_r', name: 'Tríceps', d: 'M125,124 L136,157 L126,157 Z' },
    { id: 'triceps_l', name: 'Tríceps', d: 'M75,124 L64,157 L74,157 Z' },
    { id: 'latissimus_dorsi_r', name: 'Latíssimo do Dorso', d: 'M101,118 L124,132 L114,157 L101,147 Z' },
    { id: 'latissimus_dorsi_l', name: 'Latíssimo do Dorso', d: 'M99,118 L76,132 L86,157 L99,147 Z' },
    { id: 'trapezius_lower_r', name: 'Trapézio Inferior', d: 'M101,118 L109,137 L101,137 Z' },
    { id: 'trapezius_lower_l', name: 'Trapézio Inferior', d: 'M99,118 L91,137 L99,137 Z' },
    { id: 'erector_spinae', name: 'Eretores da Espinha', d: 'M97,92 H103 V157 H97 Z' },
    { id: 'quadratus_lumborum_r', name: 'Quadrado Lombar', d: 'M103,142 L111,162 L103,160 Z' },
    { id: 'quadratus_lumborum_l', name: 'Quadrado Lombar', d: 'M97,142 L89,162 L97,160 Z' },
    { id: 'gluteus_medius_r', name: 'Glúteo Médio', d: 'M103,152 L119,167 L109,177 Z' },
    { id: 'gluteus_medius_l', name: 'Glúteo Médio', d: 'M97,152 L81,167 L91,177 Z' },
    { id: 'gluteus_maximus_r', name: 'Glúteo Máximo', d: 'M101,162 L114,187 L101,192 Z' },
    { id: 'gluteus_maximus_l', name: 'Glúteo Máximo', d: 'M99,162 L86,187 L99,192 Z' },
    { id: 'hamstrings_r', name: 'Isquiotibiais', d: 'M106,192 L117,257 L107,257 Z' },
    { id: 'hamstrings_l', name: 'Isquiotibiais', d: 'M94,192 L83,257 L93,257 Z' },
    { id: 'gastrocnemius_r', name: 'Gastrocnêmio', d: 'M107,262 L117,332 L107,332 Z' },
    { id: 'gastrocnemius_l', name: 'Gastrocnêmio', d: 'M93,262 L83,332 L93,332 Z' },
    { id: 'tibialis_posterior_r', name: 'Tibial Posterior', d: 'M108,334 L113,352 L108,352 Z' },
    { id: 'tibialis_posterior_l', name: 'Tibial Posterior', d: 'M92,334 L87,352 L92,352 Z' },
    { id: 'forearm_extensors_r', name: 'Extensores do Antebraço', d: 'M126,160 L133,190 L124,190 Z' },
    { id: 'forearm_extensors_l', name: 'Extensores do Antebraço', d: 'M74,160 L67,190 L76,190 Z' },
  ],
};
