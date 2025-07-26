import type { EasingFunction } from '../types';

/**
 * Easing functions for smooth animations
 * t = current time, b = start value, c = change in value, d = duration
 */
export const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t: number) => t,
  
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

/**
 * Animation timeline class for managing frame-based animations
 */
export class AnimationTimeline {
  private startTime: number = 0;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private animationId: number | null = null;
  
  public duration: number;
  public fps: number;
  public loop: boolean;
  public easing: EasingFunction;
  
  constructor(
    duration: number,
    fps: number = 60,
    loop: boolean = true,
    easing: EasingFunction = 'linear'
  ) {
    this.duration = duration;
    this.fps = fps;
    this.loop = loop;
    this.easing = easing;
  }
  
  /**
   * Get normalized time (0-1) based on current position
   */
  getNormalizedTime(): number {
    if (this.duration === 0) return 0;
    const elapsed = (this.currentTime - this.startTime) / 1000;
    let t = Math.min(elapsed / this.duration, 1);
    
    if (this.loop && t >= 1) {
      t = t % 1;
    }
    
    return easingFunctions[this.easing](t);
  }
  
  /**
   * Get current frame number
   */
  getCurrentFrame(): number {
    const elapsed = (this.currentTime - this.startTime) / 1000;
    return Math.floor(elapsed * this.fps);
  }
  
  /**
   * Get total number of frames
   */
  getTotalFrames(): number {
    return Math.floor(this.duration * this.fps);
  }
  
  /**
   * Start the animation
   */
  play(onFrame?: (timeline: AnimationTimeline) => void): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = performance.now();
    
    const animate = (currentTime: number) => {
      this.currentTime = currentTime;
      
      onFrame?.(this);
      
      const elapsed = (currentTime - this.startTime) / 1000;
      
      if (elapsed < this.duration || this.loop) {
        this.animationId = requestAnimationFrame(animate);
        
        if (this.loop && elapsed >= this.duration) {
          this.startTime = currentTime;
        }
      } else {
        this.stop();
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * Pause the animation
   */
  pause(): void {
    if (!this.isPlaying || this.isPaused) return;
    
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Resume the animation
   */
  resume(): void {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    const pausedDuration = performance.now() - this.currentTime;
    this.startTime += pausedDuration;
    this.play();
  }
  
  /**
   * Stop the animation
   */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Seek to specific time (0-1)
   */
  seekTo(normalizedTime: number): void {
    const targetTime = normalizedTime * this.duration;
    this.startTime = performance.now() - (targetTime * 1000);
  }
  
  /**
   * Check if animation is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying && !this.isPaused;
  }
  
  /**
   * Check if animation is paused
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }
}

/**
 * Create animation-friendly parameter that changes over time
 */
export function animateParameter(
  startValue: number,
  endValue: number,
  normalizedTime: number,
  easing: EasingFunction = 'linear'
): number {
  const easedTime = easingFunctions[easing](normalizedTime);
  return startValue + (endValue - startValue) * easedTime;
}

/**
 * Animation presets for common patterns
 */
export const animationPresets = {
  fadeIn: {
    name: 'Fade In',
    duration: 2,
    easing: 'easeOutQuad' as EasingFunction,
    description: 'Gentle fade in effect'
  },
  bounceIn: {
    name: 'Bounce In',
    duration: 1.5,
    easing: 'bounce' as EasingFunction,
    description: 'Bouncy entrance animation'
  },
  slideIn: {
    name: 'Slide In',
    duration: 1,
    easing: 'easeInOutCubic' as EasingFunction,
    description: 'Smooth sliding motion'
  },
  elastic: {
    name: 'Elastic',
    duration: 2.5,
    easing: 'easeInOutBack' as EasingFunction,
    description: 'Elastic spring effect'
  },
  pulse: {
    name: 'Pulse',
    duration: 1,
    easing: 'easeInOutQuad' as EasingFunction,
    description: 'Rhythmic pulsing animation'
  }
} as const;