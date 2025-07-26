import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { RendererConfig } from '../../types';
import { setGlobalSeed, resetGlobalRNG } from '../../utils/seededRNG';

interface ThreeRendererProps {
  sketch: (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => (() => void) | void;
  config: RendererConfig;
  seed: string;
  onError?: (error: Error) => void;
  className?: string;
}

export const ThreeRenderer: React.FC<ThreeRendererProps> = ({
  sketch,
  config,
  seed,
  onError,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);

  const createThreeScene = useCallback(() => {
    if (!containerRef.current) return;

    try {
      // Set the global seed before running the sketch
      setGlobalSeed(seed);
      resetGlobalRNG();

      // Clean up existing scene
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Create renderer with WebGL optimizations
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: config.preserveDrawingBuffer || false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      });
      
      // WebGL performance optimizations
      renderer.setSize(config.width, config.height);
      renderer.setPixelRatio(Math.min(config.pixelDensity || window.devicePixelRatio, 2)); // Cap at 2x for performance
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      
      // Enable frustum culling and occlusion culling
      renderer.sortObjects = true;
      
      // Memory management
      renderer.info.autoReset = false;
      
      // Create scene
      const scene = new THREE.Scene();
      
      // Create default camera
      const camera = new THREE.PerspectiveCamera(
        75,
        config.width / config.height,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Clear container and append renderer
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      // Store references
      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;


      // Call user's sketch function
      const cleanup = sketch(scene, camera, renderer);
      if (typeof cleanup === 'function') {
        cleanupFnRef.current = cleanup;
      }

      // Start optimized render loop with frame rate limiting
      const targetFPS = 60;
      const frameInterval = 1000 / targetFPS;
      
      const animate = (currentTime: number) => {
        const deltaTime = currentTime - lastFrameTimeRef.current;
        
        if (deltaTime >= frameInterval) {
          // FPS monitoring (less frequent to reduce overhead)
          frameCountRef.current++;
          if (frameCountRef.current % 120 === 0) {
            fpsRef.current = Math.round(1000 / deltaTime);
            if (fpsRef.current < 30) {
              console.warn(`Three.js renderer FPS dropped to ${fpsRef.current}`);
            }
          }
          
          // Reset memory info counter
          renderer.info.reset();
          
          resetGlobalRNG(); // Reset RNG for each frame
          
          renderer.render(scene, camera);
          
          lastFrameTimeRef.current = currentTime;
        }
        
        animationIdRef.current = requestAnimationFrame(animate);
      };
      
      lastFrameTimeRef.current = performance.now();
      animate(lastFrameTimeRef.current);

    } catch (error) {
      console.error('Three.js Sketch Error:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [sketch, config, seed, onError]);

  useEffect(() => {
    createThreeScene();

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        // Dispose of all geometries and materials
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [createThreeScene]);

  // Handle resize
  useEffect(() => {
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(config.width, config.height);
      if (cameraRef.current instanceof THREE.PerspectiveCamera) {
        cameraRef.current.aspect = config.width / config.height;
        cameraRef.current.updateProjectionMatrix();
      }
    }
  }, [config.width, config.height]);

  return (
    <div 
      ref={containerRef} 
      className={`three-renderer ${className}`}
      style={{ width: config.width, height: config.height }}
    />
  );
};

export default ThreeRenderer;