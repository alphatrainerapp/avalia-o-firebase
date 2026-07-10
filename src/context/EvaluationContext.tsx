
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { clients as initialClients, evaluations as initialEvaluations, type Evaluation, type Client, audienceProtocols } from '@/lib/data';

type EvaluationContextType = {
  clients: Client[];
  allEvaluations: Evaluation[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  addEvaluation: (clientId: string) => Evaluation;
  setAllEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [clients] = useState<Client[]>(initialClients);
  const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClients[0].id);

  const addEvaluation = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) throw new Error("Client not found");

    const agora = new Date();
    const year = agora.getFullYear();
    const month = String(agora.getMonth() + 1).padStart(2, '0');
    const day = String(agora.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;

    // Note: Removed the strict "one per day" blocking to allow manual date editing for historical records.
    // However, if an evaluation with the exact ID/Date somehow collided, we handle it by creating a unique ID.
    
    const newEvalId = `eval_${allEvaluations.length + 1}_${Date.now()}`;
    const newEvaluation: Evaluation = {
      id: newEvalId,
      clientId: client.id,
      clientName: client.name,
      date: localDateString,
      protocol: Object.keys(audienceProtocols).length > 0 ? audienceProtocols[Object.keys(audienceProtocols)[0]][0] : '',
      bodyMeasurements: { 
        weight: 0, 
        height: client.height, 
        waistCircumference: 0, 
        hipCircumference: 0 
      },
      bodyComposition: { bodyFatPercentage: 0 },
      perimetria: {},
      skinFolds: {},
      boneDiameters: {},
      bioimpedance: { scaleType: null },
      posturalPhotos: {},
      posturalDeviations: {},
      observations: '',
    };

    setAllEvaluations(prevEvals => 
      [...prevEvals, newEvaluation].sort((a, b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime())
    );

    return newEvaluation;
  }, [clients, allEvaluations]);

  return (
    <EvaluationContext.Provider value={{ clients, allEvaluations, selectedClientId, setSelectedClientId, addEvaluation, setAllEvaluations }}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluationContext = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluationContext must be used within an EvaluationProvider');
  }
  return context;
};
