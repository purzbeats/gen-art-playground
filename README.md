# Generative Art Playground

A deterministic seed-based generative art playground built with React, supporting both p5.js and three.js projects.

## Features

- **Deterministic Seed System**: All randomness is seeded, ensuring reproducible results
- **Dual Framework Support**: Create art with both p5.js (2D) and three.js (3D)
- **Live Code Editor**: Built-in Monaco editor with syntax highlighting
- **Real-time Preview**: See changes instantly as you code
- **Project Management**: Save, load, and organize multiple projects
- **Parameter Controls**: Add interactive controls with simple annotations
- **Export Capabilities**: Share projects and configurations

<img width="1905" height="979" alt="image" src="https://github.com/user-attachments/assets/7c59922b-9c99-4a77-bb07-100c777b2db0" />

## Getting Started

### Installation

```bash
npm install
npm run dev
```

The playground will be available at `http://localhost:5173`

### Creating Your First Project

1. Click "New Project" in the header
2. Enter a project name
3. Choose either "p5" for 2D canvas art or "three" for 3D WebGL art
4. Start coding in the editor!

## Deterministic Random Functions

The playground provides seeded random functions that ensure reproducible results:

```javascript
// Available globally in your sketches
random()                    // Random float 0-1
randomRange(min, max)       // Random float in range
randomInt(min, max)         // Random integer in range
choice(array)              // Pick random item from array
shuffle(array)             // Randomly shuffle array copy
```

## p5.js Example

```javascript
function setup(p) {
  p.background(20, 20, 30);
  
  // Draw 100 random circles with seeded randomness
  for (let i = 0; i < 100; i++) {
    const x = randomRange(0, p.width);
    const y = randomRange(0, p.height);
    const size = randomRange(5, 50);
    
    p.fill(
      randomRange(100, 255),
      randomRange(100, 255), 
      randomRange(150, 255),
      150
    );
    p.noStroke();
    p.circle(x, y, size);
  }
}
```

## three.js Example

```javascript
function setup(scene, camera, renderer) {
  renderer.setClearColor(0x111122);
  
  // Create random cubes
  for (let i = 0; i < 50; i++) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(random(), random(), random())
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      randomRange(-3, 3),
      randomRange(-3, 3),
      randomRange(-3, 3)
    );
    
    scene.add(cube);
  }
  
  camera.position.z = 5;
}
```

## Seed Management

- **Seed Input**: Manually enter seeds for specific results
- **New Seed Button**: Generate a fresh random seed
- **URL Sharing**: Seeds are included in shareable URLs (future feature)
- **Deterministic Output**: Same seed always produces identical results

## Project Structure

```
src/
├── components/
│   ├── renderers/          # p5.js and three.js wrappers
│   ├── ui/                 # Reusable UI components
│   └── Playground.tsx      # Main playground component
├── stores/                 # Zustand state management
├── utils/                  # Seeded RNG utilities
├── types/                  # TypeScript type definitions
└── templates/              # Example code templates
```

## Technical Details

### Deterministic Randomness
Uses the `seedrandom` library to ensure all random operations are deterministic and reproducible across sessions.

### Framework Integration
- **p5.js**: Uses instance mode to avoid global conflicts with React
- **three.js**: Proper resource cleanup and memory management
- Both frameworks share the same seeded RNG system

### State Management
Zustand handles project state, renderer configuration, and UI state with persistence to localStorage.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Enhancements

- Parameter annotation system (@param comments)
- Animation/GIF export
- Gallery of community creations
- URL-based project sharing
- Advanced parameter controls (sliders, color pickers)
- Plugin system for custom utilities

## Changelog

### Phase 1: Code Quality & Foundation (v1.1.0)
- **Fixed TypeScript Issues**: Replaced `any` types with proper `ParameterValue` union type
- **Resolved React Hook Dependencies**: Fixed missing dependencies in useEffect hooks
- **Added Error Boundaries**: Implemented comprehensive error handling with ErrorBoundary component
- **Bundle Optimization**: Reduced main bundle from 1.9MB to 191KB with code splitting
- **Architecture Improvements**: 
  - Removed global window pollution with RNG context system
  - Added lazy loading for Monaco Editor and renderers
  - Implemented proper cleanup patterns with Suspense

## Contributing

This is a playground project perfect for experimenting with generative art concepts. Feel free to extend and modify as needed!
