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

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: config.preserveDrawingBuffer || false
      });
      renderer.setSize(config.width, config.height);
      renderer.setPixelRatio(config.pixelDensity || window.devicePixelRatio);
      
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

      // Start render loop
      const animate = () => {
        resetGlobalRNG(); // Reset RNG for each frame
        renderer.render(scene, camera);
        animationIdRef.current = requestAnimationFrame(animate);
      };
      animate();

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