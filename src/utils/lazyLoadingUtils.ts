/**
 * Lazy loading utilities for optimal bundle splitting and preloading
 */
import React from 'react';

// Preload critical chunks
const preloadedChunks = new Set<string>();

/**
 * Preload a module without executing it
 */
export function preloadModule(moduleFactory: () => Promise<any>, chunkName?: string): void {
  if (chunkName && preloadedChunks.has(chunkName)) {
    return;
  }

  // Use link rel=preload for better browser optimization
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      moduleFactory().catch(() => {
        // Silently fail preloading, module will be loaded on demand
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      moduleFactory().catch(() => {});
    }, 100);
  }

  if (chunkName) {
    preloadedChunks.add(chunkName);
  }
}

/**
 * Create a lazy-loaded component with error boundary and loading state
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  _fallback?: React.ComponentType,
  chunkName?: string
) {
  const LazyComponent = React.lazy(factory);
  
  // Preload the component after initial render
  React.useEffect(() => {
    preloadModule(factory, chunkName);
  }, []);

  return LazyComponent;
}

/**
 * Preload heavy dependencies based on user interaction patterns
 */
export function preloadHeavyDependencies(): void {
  // Preload Monaco Editor when user hovers over code-related buttons
  preloadModule(
    () => import('@monaco-editor/react'),
    'monaco-editor'
  );
  
  // Preload Three.js when user creates a Three.js project
  preloadModule(
    () => import('three'),
    'three-js'
  );
  
  // Preload p5.js 
  preloadModule(
    () => import('p5'),
    'p5-js'
  );
}

/**
 * Progressive enhancement for heavy features
 */
export function enableProgressiveEnhancement(): void {
  if (typeof window === 'undefined') return;

  // Preload on user interaction
  const interactionEvents = ['mousedown', 'touchstart', 'keydown'];
  
  const handleFirstInteraction = () => {
    preloadHeavyDependencies();
    
    // Remove listeners after first interaction
    interactionEvents.forEach(event => {
      document.removeEventListener(event, handleFirstInteraction);
    });
  };

  interactionEvents.forEach(event => {
    document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
  });

  // Also preload after page load with delay
  window.addEventListener('load', () => {
    setTimeout(preloadHeavyDependencies, 2000);
  }, { once: true });
}

/**
 * Bundle analyzer helper to identify heavy chunks
 */
export function logBundleInfo(): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.log('Preloaded chunks:', Array.from(preloadedChunks));
    
    // Log performance marks if available
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        console.log('Page load performance:', {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A',
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A'
        });
      }
    }
  }
}

// Auto-enable progressive enhancement
if (typeof window !== 'undefined') {
  enableProgressiveEnhancement();
}