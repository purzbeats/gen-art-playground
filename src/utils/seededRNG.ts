import seedrandom from 'seedrandom';
import type { SeededRNG } from '../types';

export class SeededRandomGenerator implements SeededRNG {
  private rng: seedrandom.PRNG;
  public readonly seed: string;
  private originalSeed: string;

  constructor(seed?: string) {
    this.seed = seed || this.generateSeed();
    this.originalSeed = this.seed;
    this.rng = seedrandom(this.seed);
  }

  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  random(): number {
    return this.rng();
  }

  randomRange(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.randomRange(min, max + 1));
  }

  choice<T>(array: T[]): T {
    const index = this.randomInt(0, array.length - 1);
    return array[index];
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  reset(): void {
    this.rng = seedrandom(this.originalSeed);
  }

  clone(): SeededRNG {
    return new SeededRandomGenerator(this.seed);
  }

  static fromSeed(seed: string): SeededRandomGenerator {
    return new SeededRandomGenerator(seed);
  }
}

// Global RNG instance for convenience
export let globalRNG: SeededRandomGenerator = new SeededRandomGenerator();

export const setGlobalSeed = (seed: string): void => {
  globalRNG = new SeededRandomGenerator(seed);
};

export const resetGlobalRNG = (): void => {
  globalRNG.reset();
};

// Convenience functions that use the global RNG
export const random = (): number => globalRNG.random();
export const randomRange = (min: number, max: number): number => globalRNG.randomRange(min, max);
export const randomInt = (min: number, max: number): number => globalRNG.randomInt(min, max);
export const choice = <T>(array: T[]): T => globalRNG.choice(array);
export const shuffle = <T>(array: T[]): T[] => globalRNG.shuffle(array);