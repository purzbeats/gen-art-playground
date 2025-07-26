import { setGlobalSeed, random, randomRange, randomInt, choice, shuffle } from './seededRNG';

// Helper function to inject RNG functions into user code execution context
export const createRNGExecutionContext = (seed: string) => {
  setGlobalSeed(seed);
  return {
    random,
    randomRange,
    randomInt,
    choice,
    shuffle
  };
};