import { setGlobalSeed, random, randomRange, randomInt, choice, shuffle } from './seededRNG';

/**
 * Global animation state
 */
let currentAnimationTime = 0;
let currentAnimationFrame = 0;

// Listen for animation updates
if (typeof window !== 'undefined') {
  window.addEventListener('animationFrame', (event: any) => {
    currentAnimationTime = event.detail.time || 0;
    currentAnimationFrame = event.detail.frame || 0;
  });
}

// Helper function to inject RNG functions into user code execution context
export const createRNGExecutionContext = (seed: string) => {
  setGlobalSeed(seed);
  return {
    random,
    randomRange,
    randomInt,
    choice,
    shuffle,
    
    // Animation functions
    animateTime: () => currentAnimationTime,
    animateFrame: () => currentAnimationFrame,
    animateValue: (start: number, end: number) => start + (end - start) * currentAnimationTime,
    animateSin: (frequency: number = 1, amplitude: number = 1, offset: number = 0) => 
      offset + amplitude * Math.sin(currentAnimationTime * frequency * Math.PI * 2),
    animateCos: (frequency: number = 1, amplitude: number = 1, offset: number = 0) => 
      offset + amplitude * Math.cos(currentAnimationTime * frequency * Math.PI * 2)
  };
};