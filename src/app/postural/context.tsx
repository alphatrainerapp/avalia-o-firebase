'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useEvaluationContext } from '@/context/EvaluationContext';

export type Deviations = { [key: string]: string[] };

type PosturalContextType = {
  photos: { [key: string]: string | undefined };
  setPhoto: (type: string, url: string) => void;
  deviations: Deviations;
  toggleDeviation: (view: string, deviation: string) => void;
  clearPosturalData: () => void;
  loadPosturalData: (data: { photos: { [key: string]: string | undefined }, deviations: Deviations }) => void;
  isSaved: boolean;
  saveAnalysis: (evaluationId: string | null) => void;
  activeEvaluationId: string | null;
  setActiveEvaluationId: (id: string | null) => void;
};

const PosturalContext = createContext<PosturalContextType | undefined>(undefined);

export const PosturalContextProvider = ({ children }: { children: ReactNode }) => {
  const { setAllEvaluations } = useEvaluationContext();
  const [photos, setPhotos] = useState<{ [key: string]: string | undefined }>({});
  const [deviations, setDeviations] = useState<Deviations>({});
  const [isSaved, setIsSaved] = useState(true);
  const [activeEvaluationId, setActiveEvaluationId] = useState<string | null>(null);

  const setPhoto = useCallback((type: string, url: string) => {
    setPhotos(prev => ({ ...prev, [type]: url }));
    setIsSaved(false);
  }, []);

  const toggleDeviation = useCallback((view: string, deviation: string) => {
    setDeviations(prev => {
        const currentDeviations = prev[view] || [];
        const isSelected = currentDeviations.includes(deviation);

        if (isSelected) {
            const newViewDeviations = currentDeviations.filter(d => d !== deviation);
            return { ...prev, [view]: newViewDeviations };
        } else {
            const newViewDeviations = [...currentDeviations, deviation];
            return { ...prev, [view]: newViewDeviations };
        }
    });
    setIsSaved(false);
  }, []);

  const clearPosturalData = useCallback(() => {
    setPhotos({});
    setDeviations({});
    setIsSaved(true);
    setActiveEvaluationId(null);
  }, []);
  
  const loadPosturalData = useCallback((data: { photos: { [key: string]: string | undefined }, deviations: Deviations }) => {
    setPhotos(data.photos || {});
    setDeviations(data.deviations || {});
    setIsSaved(true);
  }, []);

  const saveAnalysis = useCallback((evaluationId: string | null) => {
    if (!evaluationId) return;

    setAllEvaluations(prevEvals =>
        prevEvals.map(ev =>
            ev.id === evaluationId
                ? { ...ev, posturalPhotos: photos, posturalDeviations: deviations }
                : ev
        )
    );
    setIsSaved(true);
  }, [photos, deviations, setAllEvaluations]);

  return (
    <PosturalContext.Provider value={{ 
        photos, 
        setPhoto, 
        deviations, 
        toggleDeviation, 
        clearPosturalData, 
        loadPosturalData, 
        isSaved, 
        saveAnalysis,
        activeEvaluationId,
        setActiveEvaluationId
    }}>
      {children}
    </PosturalContext.Provider>
  );
};

export const usePosturalContext = () => {
  const context = useContext(PosturalContext);
  if (context === undefined) {
    throw new Error('usePosturalContext must be used within a PosturalContextProvider');
  }
  return context;
};
