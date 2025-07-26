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

// Animation functions (new in Phase 4)
animateTime()              // Current animation time [0, 1]
animateFrame()             // Current animation frame number
animateValue(start, end)   // Animate between two values
animateSin(freq, amp, off) // Animated sine wave
animateCos(freq, amp, off) // Animated cosine wave
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

- Community gallery of shared creations
- Project versioning and fork/remix functionality
- User authentication and profiles
- Plugin system for custom utilities
- Advanced collaboration features

## Changelog

### Phase 4: Advanced Features (v1.4.0)
- **Animation System**:
  - Timeline-based animation controls with play/pause/stop functionality
  - Comprehensive easing functions (linear, quad, cubic, back, bounce)
  - Animation presets (fadeIn, bounceIn, slideIn, elastic, pulse)
  - Global animation functions available in sketches (animateTime, animateFrame, etc)
- **Performance & Optimization**:
  - WebGL renderer optimization with high-performance settings and frame rate limiting
  - Intelligent lazy loading with preloading based on user interaction patterns
  - Virtual scrolling for project browser when >20 projects
  - Reduced FPS monitoring overhead and enhanced memory management
- **Advanced Parameter Controls**:
  - Enhanced parameter system with vector2, vector3, and range parameter types
  - 16-color palette picker for color parameters
  - Vector coordinate inputs with labeled X/Y/Z fields
  - Parameter parsing extended to support new @param comment types
- **Code Editor Enhancements**:
  - 100+ custom completions for p5.js and Three.js functions
  - Live error detection with squiggles and contextual warnings
  - Quick fixes for common coding issues (semicolons, THREE. prefixes)
  - Enhanced TypeScript definitions and hover documentation
- **Bug Fixes**:
  - Fixed parameter slider flickering by optimizing render cycles
  - Resolved infinite re-render loops in parameter updates
  - Improved renderer performance with frame rate capping

### Phase 3: User Experience Enhancement (v1.3.0)
- **Better Project Management**:
  - Visual project browser with thumbnail previews
  - Project search and filtering capabilities
  - Automatic thumbnail capture for projects
  - Replace browser prompts with proper modal dialogs
- **UI/UX Improvements**:
  - Toast notifications for user actions
  - Loading spinners for better feedback
  - Keyboard shortcuts (Cmd/Ctrl + N, O, S, E, G, P, \)
  - Create Project modal with project type descriptions
- **Error Handling**:
  - Enhanced error messages with line numbers
  - Code context display for syntax errors
  - Formatted error output with proper spacing
- **Developer Experience**:
  - Keyboard shortcuts for common actions
  - Project browser with visual grid layout
  - Quick access to projects and templates
  - Better loading states and feedback

### Phase 2: Core Feature Implementation (v1.2.0)
- **Parameter System**: 
  - Parse @param comments from code to create interactive controls
  - Support for number (with sliders), boolean, color, and select parameters
  - Real-time parameter updates that instantly reflect in artwork
  - Auto-sync between code comments and UI controls
- **Export Functionality**:
  - PNG image export with current canvas size
  - JSON project export with all code and settings
  - Shareable URL generation with embedded project data
  - Automatic URL import on page load
- **Template System**:
  - Built-in template library with categorized examples
  - Template browser with search and filtering
  - Quick project creation from templates
  - Templates for both p5.js and Three.js
- **UI Improvements**:
  - Added Parameter Panel for live control manipulation
  - Added Export Panel with multiple format options
  - Enhanced default templates with parameter examples
  - Added ghost button variant for better UI consistency

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
