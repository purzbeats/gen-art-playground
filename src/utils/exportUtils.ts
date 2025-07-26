import type { Project } from '../types';

export interface ExportOptions {
  format: 'png' | 'svg' | 'json';
  width?: number;
  height?: number;
  quality?: number;
  fileName?: string;
}

/**
 * Exports a canvas as an image file
 */
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  options: ExportOptions
): Promise<void> {
  const { format, fileName } = options;
  
  if (format === 'png') {
    // Export as PNG
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, fileName || 'artwork.png');
      }
    }, 'image/png');
  } else if (format === 'svg') {
    // For SVG export, we need to render the canvas content to SVG
    // This is complex for p5.js/three.js, so for now we'll export as PNG
    console.warn('SVG export not yet implemented, exporting as PNG instead');
    exportCanvas(canvas, { ...options, format: 'png' });
  }
}

/**
 * Exports project data as JSON
 */
export function exportProjectAsJSON(project: Project): void {
  const projectData = {
    ...project,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: 'application/json'
  });
  
  downloadBlob(blob, `${project.name}.json`);
}

/**
 * Exports project as a shareable URL
 */
export function exportProjectAsURL(project: Project): string {
  const projectData = {
    name: project.name,
    type: project.type,
    code: project.code,
    seed: project.seed,
    parameters: project.parameters
  };
  
  const compressed = btoa(JSON.stringify(projectData));
  const url = new URL(window.location.href);
  url.searchParams.set('project', compressed);
  
  return url.toString();
}

/**
 * Imports project from URL parameter
 */
export function importProjectFromURL(): Project | null {
  const url = new URL(window.location.href);
  const projectData = url.searchParams.get('project');
  
  if (!projectData) return null;
  
  try {
    const decoded = JSON.parse(atob(projectData));
    return {
      id: crypto.randomUUID(),
      name: decoded.name || 'Imported Project',
      type: decoded.type || 'p5',
      code: decoded.code || '',
      seed: decoded.seed || 'default',
      parameters: decoded.parameters || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Failed to import project from URL:', error);
    return null;
  }
}

/**
 * Utility function to download a blob as a file
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get canvas from p5 or three.js renderer
 */
export function getRendererCanvas(): HTMLCanvasElement | null {
  // Try to find p5.js canvas
  const p5Canvas = document.querySelector('canvas[id^="p5_canvas"]');
  if (p5Canvas instanceof HTMLCanvasElement) {
    return p5Canvas;
  }
  
  // Try to find three.js canvas
  const threeCanvas = document.querySelector('canvas');
  if (threeCanvas instanceof HTMLCanvasElement) {
    return threeCanvas;
  }
  
  return null;
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}