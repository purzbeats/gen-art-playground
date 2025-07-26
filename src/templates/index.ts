export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'patterns' | 'animation' | 'interactive' | '3d';
  type: 'p5' | 'three';
  code: string;
  thumbnail?: string;
  tags: string[];
}

export const P5_TEMPLATES: Template[] = [
  {
    id: 'p5-circles',
    name: 'Random Circles',
    description: 'Basic p5.js template with parametric random circles',
    category: 'basic',
    type: 'p5',
    tags: ['beginner', 'shapes', 'color'],
    code: `// Random Circles Template
// @param {number} circleCount - Number of circles to draw [min=10, max=200, default=50]
// @param {number} minSize - Minimum circle size [min=5, max=50, default=10]
// @param {number} maxSize - Maximum circle size [min=20, max=200, default=50]
// @param {color} bgColor - Background color [default=#000000]
// @param {boolean} showStroke - Show circle outlines [default=false]

const circleCount = 50;
const minSize = 10;
const maxSize = 50;
const bgColor = "#000000";
const showStroke = false;

function setup(p) {
  p.background(bgColor);
  
  for (let i = 0; i < circleCount; i++) {
    p.fill(randomRange(0, 255), randomRange(0, 255), randomRange(0, 255), 150);
    
    if (showStroke) {
      p.stroke(255);
      p.strokeWeight(1);
    } else {
      p.noStroke();
    }
    
    p.circle(
      randomRange(0, p.width),
      randomRange(0, p.height),
      randomRange(minSize, maxSize)
    );
  }
}`
  },
  {
    id: 'p5-grid',
    name: 'Grid Pattern',
    description: 'Create geometric grid patterns with customizable spacing',
    category: 'patterns',
    type: 'p5',
    tags: ['grid', 'geometric', 'pattern'],
    code: `// Grid Pattern Template
// @param {number} gridSize - Size of grid cells [min=10, max=100, default=30]
// @param {number} spacing - Space between cells [min=2, max=20, default=5]
// @param {color} cellColor - Color of grid cells [default=#3366ff]
// @param {color} bgColor - Background color [default=#ffffff]
// @param {select} shape - Shape type [options=circle,square,triangle]

const gridSize = 30;
const spacing = 5;
const cellColor = "#3366ff";
const bgColor = "#ffffff";
const shape = "circle";

function setup(p) {
  p.background(bgColor);
  p.fill(cellColor);
  p.noStroke();
  
  const cols = Math.floor(p.width / (gridSize + spacing));
  const rows = Math.floor(p.height / (gridSize + spacing));
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const px = x * (gridSize + spacing) + spacing;
      const py = y * (gridSize + spacing) + spacing;
      
      // Add some randomness
      const size = gridSize * randomRange(0.5, 1.2);
      
      if (shape === 'circle') {
        p.circle(px + gridSize/2, py + gridSize/2, size);
      } else if (shape === 'square') {
        p.rect(px, py, size, size);
      } else if (shape === 'triangle') {
        p.triangle(px, py + size, px + size/2, py, px + size, py + size);
      }
    }
  }
}`
  },
  {
    id: 'p5-noise-field',
    name: 'Noise Field',
    description: 'Flow field based on Perlin noise for organic patterns',
    category: 'patterns',
    type: 'p5',
    tags: ['noise', 'flow', 'organic'],
    code: `// Noise Field Template
// @param {number} particleCount - Number of particles [min=100, max=2000, default=500]
// @param {number} noiseScale - Scale of noise field [min=0.001, max=0.1, step=0.001, default=0.01]
// @param {number} stepSize - Movement step size [min=0.5, max=5, step=0.1, default=1]
// @param {color} particleColor - Particle color [default=#ffffff]
// @param {color} bgColor - Background color [default=#000000]

const particleCount = 500;
const noiseScale = 0.01;
const stepSize = 1;
const particleColor = "#ffffff";
const bgColor = "#000000";

function setup(p) {
  p.background(bgColor);
  p.stroke(particleColor);
  p.strokeWeight(1);
  p.noFill();
  
  // Create particles at random positions
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: randomRange(0, p.width),
      y: randomRange(0, p.height)
    });
  }
  
  // Draw flow field
  for (let step = 0; step < 100; step++) {
    for (let particle of particles) {
      // Get noise value at current position
      const angle = p.noise(particle.x * noiseScale, particle.y * noiseScale) * Math.PI * 2;
      
      // Draw line to next position
      const nextX = particle.x + Math.cos(angle) * stepSize;
      const nextY = particle.y + Math.sin(angle) * stepSize;
      
      p.line(particle.x, particle.y, nextX, nextY);
      
      // Update particle position
      particle.x = nextX;
      particle.y = nextY;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = p.width;
      if (particle.x > p.width) particle.x = 0;
      if (particle.y < 0) particle.y = p.height;
      if (particle.y > p.height) particle.y = 0;
    }
  }
}`
  }
];

export const THREE_TEMPLATES: Template[] = [
  {
    id: 'three-cubes',
    name: 'Random Cubes',
    description: 'Basic Three.js template with parametric 3D shapes',
    category: 'basic',
    type: 'three',
    tags: ['beginner', '3d', 'shapes'],
    code: `// Random Cubes Template
// @param {number} cubeCount - Number of cubes to create [min=5, max=100, default=20]
// @param {number} cubeSize - Size of each cube [min=0.1, max=1.0, step=0.1, default=0.2]
// @param {number} spread - How spread out the cubes are [min=1, max=10, default=3]
// @param {color} bgColor - Background color [default=#000000]
// @param {select} shapeType - Type of shape [options=cube,sphere,cylinder]

const cubeCount = 20;
const cubeSize = 0.2;
const spread = 3;
const bgColor = "#000000";
const shapeType = "cube";

function setup(scene, camera, renderer) {
  renderer.setClearColor(bgColor);
  
  for (let i = 0; i < cubeCount; i++) {
    let geometry;
    
    switch (shapeType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(cubeSize, 8, 6);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(cubeSize, cubeSize, cubeSize * 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    }
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(random(), random(), random())
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      randomRange(-spread, spread),
      randomRange(-spread, spread),
      randomRange(-spread, spread)
    );
    
    scene.add(mesh);
  }
  
  camera.position.z = 5;
}`
  },
  {
    id: 'three-spiral',
    name: '3D Spiral',
    description: 'Create a spiral of objects in 3D space',
    category: 'patterns',
    type: 'three',
    tags: ['spiral', '3d', 'pattern'],
    code: `// 3D Spiral Template
// @param {number} objectCount - Number of objects in spiral [min=10, max=200, default=50]
// @param {number} spiralRadius - Radius of spiral [min=1, max=10, default=3]
// @param {number} spiralHeight - Height of spiral [min=1, max=20, default=5]
// @param {number} objectSize - Size of each object [min=0.05, max=0.5, step=0.05, default=0.1]
// @param {color} bgColor - Background color [default=#001122]

const objectCount = 50;
const spiralRadius = 3;
const spiralHeight = 5;
const objectSize = 0.1;
const bgColor = "#001122";

function setup(scene, camera, renderer) {
  renderer.setClearColor(bgColor);
  
  for (let i = 0; i < objectCount; i++) {
    const t = i / objectCount;
    const angle = t * Math.PI * 8; // 4 full rotations
    const height = (t - 0.5) * spiralHeight;
    
    const geometry = new THREE.SphereGeometry(objectSize, 8, 6);
    const hue = t; // Color changes along spiral
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, 0.6)
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.cos(angle) * spiralRadius,
      height,
      Math.sin(angle) * spiralRadius
    );
    
    scene.add(mesh);
  }
  
  camera.position.set(5, 2, 5);
  camera.lookAt(0, 0, 0);
}`
  }
];

export const ALL_TEMPLATES = [...P5_TEMPLATES, ...THREE_TEMPLATES];

export const TEMPLATE_CATEGORIES = [
  { id: 'basic', name: 'Basic', description: 'Simple templates to get started' },
  { id: 'patterns', name: 'Patterns', description: 'Geometric and organic patterns' },
  { id: 'animation', name: 'Animation', description: 'Moving and changing visuals' },
  { id: 'interactive', name: 'Interactive', description: 'Mouse and keyboard interactions' },
  { id: '3d', name: '3D', description: 'Three-dimensional graphics' }
];

export function getTemplatesByCategory(category: string): Template[] {
  return ALL_TEMPLATES.filter(template => template.category === category);
}

export function getTemplatesByType(type: 'p5' | 'three'): Template[] {
  return ALL_TEMPLATES.filter(template => template.type === type);
}

export function searchTemplates(query: string): Template[] {
  const lowercaseQuery = query.toLowerCase();
  return ALL_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}