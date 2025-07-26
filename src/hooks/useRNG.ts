import { useContext } from 'react';
import { RNGContext } from '../contexts/RNGContext';

export const useRNG = () => {
  const context = useContext(RNGContext);
  if (!context) {
    throw new Error('useRNG must be used within an RNGProvider');
  }
  return context;
};