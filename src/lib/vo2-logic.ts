'use client';

export type VO2Protocol = 'cooper' | 'five_km' | 'three_km' | 'balke' | 'conconi' | 'step_test' | 'cycling_power';

export interface VO2Stage {
  velocity: number; // km/h ou Watts
  hr: number; // bpm
}

export interface ZoneConfig {
  zone: string;
  desc: string;
  hrPerc: [number, number];
  vAMperc: [number, number];
  color: string;
}

export interface VO2TestData {
  protocol: VO2Protocol;
  date: string;
  weight: number;
  age: number;
  gender: 'Masculino' | 'Feminino';
  hrMax?: number;
  hrRest?: number;
  // Cooper
  distance?: number; 
  // Balke / Time based
  totalTimeSeconds?: number; 
  // Conconi
  stages?: VO2Stage[];
  // Step Test
  recoveryHR?: number;
  // Cycling Power
  powerWatts?: number;
}

export interface TrainingZone {
  zone: string;
  description: string;
  minHR: number;
  maxHR: number;
  minPace: string;
  maxPace: string;
  color: string;
}

// Configuração de zonas seguindo a solicitação (Metodologia Karvonen Clássica)
export const DEFAULT_ZONES: ZoneConfig[] = [
  { zone: 'Z1', desc: 'Regenerativa', hrPerc: [0.50, 0.60], vAMperc: [0.50, 0.60], color: '#94a3b8' },
  { zone: 'Z2', desc: 'Base Aeróbica', hrPerc: [0.60, 0.70], vAMperc: [0.60, 0.70], color: '#22c55e' },
  { zone: 'Z3', desc: 'Moderada', hrPerc: [0.70, 0.80], vAMperc: [0.70, 0.80], color: '#eab308' },
  { zone: 'Z4', desc: 'Limiar', hrPerc: [0.80, 0.90], vAMperc: [0.80, 0.90], color: '#f97316' },
  { zone: 'Z5', desc: 'Máxima', hrPerc: [0.90, 1.00], vAMperc: [0.90, 1.10], color: '#ef4444' },
];

export function calculateTanakaFCMax(age: number): number {
  return Math.round(208 - (0.7 * age));
}

export function secondsToPace(secondsPerKm: number): string {
  if (!secondsPerKm || isNaN(secondsPerKm) || secondsPerKm === Infinity) return '--:--';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function velocityToPace(kmh: number): string {
  if (!kmh || kmh <= 0) return '--:--';
  const secondsPerKm = 3600 / kmh;
  return secondsToPace(secondsPerKm);
}

export function calculateVO2(data: VO2TestData) {
  let vo2 = 0;

  switch (data.protocol) {
    case 'cooper':
      if (data.distance) {
        vo2 = (data.distance - 504.9) / 44.73;
      }
      break;
    case 'balke':
      if (data.totalTimeSeconds) {
        const mins = data.totalTimeSeconds / 60;
        vo2 = 1.444 * mins + 14.99;
      }
      break;
    case 'three_km':
    case 'five_km':
      if (data.totalTimeSeconds) {
        const dist = data.protocol === 'five_km' ? 5000 : 3000;
        const velocity = dist / (data.totalTimeSeconds / 60); // m/min
        vo2 = -4.6 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);
      }
      break;
    case 'step_test':
      if (data.recoveryHR && data.gender) {
        if (data.gender === 'Masculino') {
          vo2 = 111.33 - (0.42 * data.recoveryHR);
        } else {
          vo2 = 65.81 - (0.1847 * data.recoveryHR);
        }
      }
      break;
    case 'conconi':
      if (data.stages && data.stages.length > 0) {
        const maxVelocity = Math.max(...data.stages.map(s => s.velocity));
        vo2 = maxVelocity * 3.5; 
      }
      break;
    case 'cycling_power':
      if (data.powerWatts && data.weight) {
        vo2 = (10.8 * data.powerWatts / data.weight) + 7;
      }
      break;
  }

  return Math.max(0, parseFloat(vo2.toFixed(1)));
}

export function getVO2Classification(vo2: number, age: number, gender: 'Masculino' | 'Feminino'): string {
  if (vo2 <= 0) return 'N/A';
  
  if (gender === 'Masculino') {
    if (vo2 < 30) return 'Muito Fraco';
    if (vo2 < 35) return 'Fraco';
    if (vo2 < 45) return 'Médio';
    if (vo2 < 52) return 'Bom';
    if (vo2 < 60) return 'Excelente';
    return 'Elite';
  } else {
    if (vo2 < 25) return 'Muito Fraco';
    if (vo2 < 30) return 'Fraco';
    if (vo2 < 38) return 'Médio';
    if (vo2 < 45) return 'Bom';
    if (vo2 < 52) return 'Excelente';
    return 'Elite';
  }
}

export function getBPClassification(pas: number, pad: number): string {
  if (!pas || !pad) return '--';
  if (pas <= 120 && pad <= 80) return 'Normal';
  if (pas <= 139 || pad <= 89) return 'Pré-hipertensão';
  if (pas <= 159 || pad <= 99) return 'Hipertensão Estágio 1';
  if (pas <= 179 || pad <= 109) return 'Hipertensão Estágio 2';
  return 'Hipertensão Estágio 3';
}

export function calculateTrainingZones(vo2: number, hrMax: number, hrRest: number, vAM: number, customConfig?: ZoneConfig[]): TrainingZone[] {
  const hrReserve = Math.max(0, hrMax - hrRest);
  const baseVAM = vAM > 0 ? vAM : (vo2 / 3.5); 
  const config = customConfig || DEFAULT_ZONES;

  return config.map(z => ({
    zone: z.zone,
    description: z.desc,
    minHR: Math.round(hrRest + (hrReserve * z.hrPerc[0])),
    maxHR: Math.round(hrRest + (hrReserve * z.hrPerc[1])),
    minPace: velocityToPace(baseVAM * z.vAMperc[1]), 
    maxPace: velocityToPace(baseVAM * z.vAMperc[0]), 
    color: z.color
  }));
}

export function detectThresholdConconi(stages: VO2Stage[]): { velocity: number, hr: number } | null {
  if (stages.length < 5) return null;

  let maxDeflectionIndex = -1;
  let maxDiff = -Infinity;

  for (let i = 2; i < stages.length - 2; i++) {
    const slopeBefore = (stages[i].hr - stages[0].hr) / (stages[i].velocity - stages[0].velocity);
    const slopeAfter = (stages[stages.length - 1].hr - stages[i].hr) / (stages[stages.length - 1].velocity - stages[i].velocity);
    
    const diff = slopeBefore - slopeAfter;
    if (diff > maxDiff) {
      maxDiff = diff;
      maxDeflectionIndex = i;
    }
  }

  if (maxDeflectionIndex !== -1) {
    return stages[maxDeflectionIndex];
  }

  return null;
}
