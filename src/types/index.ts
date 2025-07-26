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
  thumbnail?: string;
  isAnimated?: boolean;
  animationSettings?: AnimationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimationSettings {
  fps: number;
  duration: number; // in seconds
  loop: boolean;
  easing: EasingFunction;
}

export type EasingFunction = 
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'bounce';

export type ParameterValue = number | boolean | string;

export interface ProjectParameter {
  name: string;
  type: 'number' | 'boolean' | 'color' | 'select' | 'vector2' | 'vector3' | 'range';
  value: ParameterValue;
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