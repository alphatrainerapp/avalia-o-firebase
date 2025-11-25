'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PosturalContextType = {
  photos: { [key: string]: string | undefined };
  setPhoto: (type: string, url: string) => void;
};

const PosturalContext = createContext<PosturalContextType | undefined>(undefined);

export const PosturalContextProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<{ [key: string]: string | undefined }>({});

  const setPhoto = (type: string, url: string) => {
    setPhotos(prev => ({ ...prev, [type]: url }));
  };

  return (
    <PosturalContext.Provider value={{ photos, setPhoto }}>
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
