/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setGlobalSeed, random, randomRange, randomInt, choice, shuffle } from '../utils/seededRNG';

export interface RNGContextType {
  random: typeof random;
  randomRange: typeof randomRange;
  randomInt: typeof randomInt;
  choice: typeof choice;
  shuffle: typeof shuffle;
  setSeed: (seed: string) => void;
}

export const RNGContext = createContext<RNGContextType | null>(null);

interface RNGProviderProps {
  children: ReactNode;
  seed?: string;
}

export const RNGProvider: React.FC<RNGProviderProps> = ({ children, seed }) => {
  useEffect(() => {
    if (seed) {
      setGlobalSeed(seed);
    }
  }, [seed]);

  const contextValue: RNGContextType = {
    random,
    randomRange,
    randomInt,
    choice,
    shuffle,
    setSeed: setGlobalSeed
  };

  return (
    <RNGContext.Provider value={contextValue}>
      {children}
    </RNGContext.Provider>
  );
};


