import React, { useRef, useEffect, useCallback } from 'react';
import p5 from 'p5';
import type { RendererConfig } from '../../types';
import { setGlobalSeed, resetGlobalRNG } from '../../utils/seededRNG';

interface P5RendererProps {
  sketch: (p: p5) => void;
  config: RendererConfig;
  seed: string;
  onError?: (error: Error) => void;
  className?: string;
}

export const P5Renderer: React.FC<P5RendererProps> = ({
  sketch,
  config,
  seed,
  onError,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const sketchRef = useRef(sketch);

  // Update sketch ref when sketch changes
  sketchRef.current = sketch;

  const createSketch = useCallback((p: p5) => {
    try {
      // Set the global seed before running the sketch
      setGlobalSeed(seed);
      resetGlobalRNG();

      // Setup canvas
      p.setup = () => {
        p.createCanvas(config.width, config.height);
        if (config.pixelDensity) {
          p.pixelDensity(config.pixelDensity);
        }
        
        // Call user's setup if it exists
        if (sketchRef.current && typeof sketchRef.current === 'function') {
          sketchRef.current(p);
        }
      };

      // Override draw to reset RNG on each frame for consistency
      const originalDraw = p.draw;
      p.draw = () => {
        resetGlobalRNG();
        if (originalDraw) {
          originalDraw();
        }
      };

    } catch (error) {
      console.error('P5 Sketch Error:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [seed, config, onError]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Clean up existing instance
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }

      // Create new p5 instance
      p5InstanceRef.current = new p5(createSketch, containerRef.current);
    } catch (error) {
      console.error('Failed to create P5 instance:', error);
      if (onError) {
        onError(error as Error);
      }
    }

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [createSketch]);

  // Handle resize
  useEffect(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.resizeCanvas(config.width, config.height);
    }
  }, [config.width, config.height]);

  return (
    <div 
      ref={containerRef} 
      className={`p5-renderer ${className}`}
      style={{ width: config.width, height: config.height }}
    />
  );
};

export default P5Renderer;