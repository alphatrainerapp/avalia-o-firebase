
'use client';

export type VO2Protocol = 'cooper' | 'five_km' | 'three_km' | 'balke' | 'conconi' | 'step_test';

export interface VO2Stage {
  velocity: number; // km/h
  hr: number; // bpm
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
        // Estimativa simples baseada no último estágio atingido
        const maxVelocity = Math.max(...data.stages.map(s => s.velocity));
        vo2 = maxVelocity * 3.5; // Estimativa genérica METs
      }
      break;
  }

  return Math.max(0, parseFloat(vo2.toFixed(1)));
}

export function getVO2Classification(vo2: number, age: number, gender: 'Masculino' | 'Feminino'): string {
  if (vo2 <= 0) return 'N/A';
  
  // Tabelas simplificadas de Cooper/ACSM
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

export function calculateTrainingZones(vo2: number, hrMax: number, hrRest: number, vAM: number): TrainingZone[] {
  const hrReserve = hrMax - hrRest;
  
  // vAM = Velocidade Aeróbica Máxima aproximada
  // Se não provida, estimamos que vAM ocorre em 100% do VO2
  const baseVAM = vAM > 0 ? vAM : (vo2 / 3.5); 

  const zonesConfig = [
    { zone: 'Z1', desc: 'Regenerativo', hrPerc: [0.50, 0.60], vAMperc: [0.55, 0.65], color: '#94a3b8' },
    { zone: 'Z2', desc: 'Endurance / Base', hrPerc: [0.60, 0.75], vAMperc: [0.65, 0.75], color: '#22c55e' },
    { zone: 'Z3', desc: 'Tempo / Moderado', hrPerc: [0.75, 0.85], vAMperc: [0.75, 0.85], color: '#eab308' },
    { zone: 'Z4', desc: 'Limiar Anaeróbico', hrPerc: [0.85, 0.92], vAMperc: [0.85, 0.95], color: '#f97316' },
    { zone: 'Z5', desc: 'VO2 Máximo', hrPerc: [0.92, 1.00], vAMperc: [0.95, 1.10], color: '#ef4444' },
  ];

  return zonesConfig.map(z => ({
    zone: z.zone,
    description: z.desc,
    minHR: Math.round(hrRest + (hrReserve * z.hrPerc[0])),
    maxHR: Math.round(hrRest + (hrReserve * z.hrPerc[1])),
    minPace: velocityToPace(baseVAM * z.vAMperc[1]), // Pace mais rápido no topo da zona
    maxPace: velocityToPace(baseVAM * z.vAMperc[0]), // Pace mais lento no fundo da zona
    color: z.color
  }));
}

// Detecção do Ponto de Deflexão de FC (Método de Conconi)
export function detectThresholdConconi(stages: VO2Stage[]): { velocity: number, hr: number } | null {
  if (stages.length < 5) return null;

  // Simplificação: O ponto de deflexão é onde a inclinação da curva FC/Velocidade diminui
  // Em um sistema real, usaríamos regressão linear segmentada
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
