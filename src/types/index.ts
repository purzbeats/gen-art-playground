export interface SeededRNG {
  seed: string;
  random(): number;
  randomRange(min: number, max: number): number;
  randomInt(min: number, max: number): number;
  choice<T>(array: T[]): T;
  shuffle<T>(array: T[]): T[];
  reset(): void;
  clone(): SeededRNG;
}

export interface Project {
  id: string;
  name: string;
  type: 'p5' | 'three';
  code: string;
  seed: string;
  parameters: ProjectParameter[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectParameter {
  name: string;
  type: 'number' | 'boolean' | 'color' | 'select';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

export interface RendererConfig {
  width: number;
  height: number;
  pixelDensity?: number;
  preserveDrawingBuffer?: boolean;
}