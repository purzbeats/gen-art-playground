/**
 * Captures a thumbnail from the current canvas
 */
export async function captureThumbnail(maxWidth: number = 200, maxHeight: number = 200): Promise<string | null> {
  // Try to find the canvas (either p5 or three.js)
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;

  try {
    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    // Calculate scaled dimensions maintaining aspect ratio
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const width = canvas.width * scale;
    const height = canvas.height * scale;

    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw scaled image
    ctx.drawImage(canvas, 0, 0, width, height);

    // Convert to data URL with compression
    return tempCanvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Failed to capture thumbnail:', error);
    return null;
  }
}

/**
 * Generates a placeholder thumbnail based on project type
 */
export function getPlaceholderThumbnail(type: 'p5' | 'three'): string {
  const svg = type === 'p5' 
    ? `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#e5e7eb"/>
        <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" fill="#6b7280">p5.js</text>
      </svg>`
    : `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#1f2937"/>
        <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" fill="#9ca3af">Three.js</text>
      </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}