/**
 * Monaco Editor custom completions for generative art playground
 */

import type * as Monaco from 'monaco-editor';

// P5.js completions
const p5Completions = [
  // Canvas
  { label: 'createCanvas', insertText: 'createCanvas(${1:width}, ${2:height})', detail: 'Creates a canvas element' },
  { label: 'resizeCanvas', insertText: 'resizeCanvas(${1:width}, ${2:height})', detail: 'Resizes the canvas' },
  { label: 'background', insertText: 'background(${1:color})', detail: 'Sets the background color' },
  
  // Drawing
  { label: 'rect', insertText: 'rect(${1:x}, ${2:y}, ${3:width}, ${4:height})', detail: 'Draws a rectangle' },
  { label: 'ellipse', insertText: 'ellipse(${1:x}, ${2:y}, ${3:width}, ${4:height})', detail: 'Draws an ellipse' },
  { label: 'circle', insertText: 'circle(${1:x}, ${2:y}, ${3:diameter})', detail: 'Draws a circle' },
  { label: 'line', insertText: 'line(${1:x1}, ${2:y1}, ${3:x2}, ${4:y2})', detail: 'Draws a line' },
  { label: 'point', insertText: 'point(${1:x}, ${2:y})', detail: 'Draws a point' },
  { label: 'triangle', insertText: 'triangle(${1:x1}, ${2:y1}, ${3:x2}, ${4:y2}, ${5:x3}, ${6:y3})', detail: 'Draws a triangle' },
  { label: 'quad', insertText: 'quad(${1:x1}, ${2:y1}, ${3:x2}, ${4:y2}, ${5:x3}, ${6:y3}, ${7:x4}, ${8:y4})', detail: 'Draws a quadrilateral' },
  
  // Transformations
  { label: 'translate', insertText: 'translate(${1:x}, ${2:y})', detail: 'Translates the coordinate system' },
  { label: 'rotate', insertText: 'rotate(${1:angle})', detail: 'Rotates the coordinate system' },
  { label: 'scale', insertText: 'scale(${1:factor})', detail: 'Scales the coordinate system' },
  { label: 'push', insertText: 'push()', detail: 'Pushes the current transformation matrix' },
  { label: 'pop', insertText: 'pop()', detail: 'Pops the current transformation matrix' },
  
  // Colors
  { label: 'fill', insertText: 'fill(${1:color})', detail: 'Sets the fill color' },
  { label: 'stroke', insertText: 'stroke(${1:color})', detail: 'Sets the stroke color' },
  { label: 'noFill', insertText: 'noFill()', detail: 'Disables fill' },
  { label: 'noStroke', insertText: 'noStroke()', detail: 'Disables stroke' },
  { label: 'strokeWeight', insertText: 'strokeWeight(${1:weight})', detail: 'Sets the stroke weight' },
  { label: 'color', insertText: 'color(${1:r}, ${2:g}, ${3:b})', detail: 'Creates a color' },
  
  // Math
  { label: 'map', insertText: 'map(${1:value}, ${2:start1}, ${3:stop1}, ${4:start2}, ${5:stop2})', detail: 'Maps a value from one range to another' },
  { label: 'lerp', insertText: 'lerp(${1:start}, ${2:stop}, ${3:amt})', detail: 'Linear interpolation' },
  { label: 'noise', insertText: 'noise(${1:x})', detail: 'Perlin noise function' },
  { label: 'sin', insertText: 'sin(${1:angle})', detail: 'Sine function' },
  { label: 'cos', insertText: 'cos(${1:angle})', detail: 'Cosine function' },
  { label: 'tan', insertText: 'tan(${1:angle})', detail: 'Tangent function' },
  { label: 'radians', insertText: 'radians(${1:degrees})', detail: 'Converts degrees to radians' },
  { label: 'degrees', insertText: 'degrees(${1:radians})', detail: 'Converts radians to degrees' },
  
  // Random
  { label: 'random', insertText: 'random(${1:max})', detail: 'Random number generator' },
  { label: 'randomSeed', insertText: 'randomSeed(${1:seed})', detail: 'Sets the random seed' },
  
  // Constants
  { label: 'TWO_PI', insertText: 'TWO_PI', detail: 'Two times PI' },
  { label: 'PI', insertText: 'PI', detail: 'PI constant' },
  { label: 'HALF_PI', insertText: 'HALF_PI', detail: 'Half PI' },
  { label: 'width', insertText: 'width', detail: 'Canvas width' },
  { label: 'height', insertText: 'height', detail: 'Canvas height' },
  { label: 'CENTER', insertText: 'CENTER', detail: 'Center alignment mode' },
  { label: 'CORNER', insertText: 'CORNER', detail: 'Corner alignment mode' },
];

// Three.js completions
const threeCompletions = [
  // Geometry
  { label: 'BoxGeometry', insertText: 'new THREE.BoxGeometry(${1:width}, ${2:height}, ${3:depth})', detail: 'Creates a box geometry' },
  { label: 'SphereGeometry', insertText: 'new THREE.SphereGeometry(${1:radius}, ${2:widthSegments}, ${3:heightSegments})', detail: 'Creates a sphere geometry' },
  { label: 'PlaneGeometry', insertText: 'new THREE.PlaneGeometry(${1:width}, ${2:height})', detail: 'Creates a plane geometry' },
  { label: 'CylinderGeometry', insertText: 'new THREE.CylinderGeometry(${1:radiusTop}, ${2:radiusBottom}, ${3:height})', detail: 'Creates a cylinder geometry' },
  { label: 'ConeGeometry', insertText: 'new THREE.ConeGeometry(${1:radius}, ${2:height})', detail: 'Creates a cone geometry' },
  { label: 'TorusGeometry', insertText: 'new THREE.TorusGeometry(${1:radius}, ${2:tube})', detail: 'Creates a torus geometry' },
  
  // Materials
  { label: 'MeshBasicMaterial', insertText: 'new THREE.MeshBasicMaterial({ color: ${1:0x00ff00} })', detail: 'Creates a basic material' },
  { label: 'MeshLambertMaterial', insertText: 'new THREE.MeshLambertMaterial({ color: ${1:0x00ff00} })', detail: 'Creates a Lambert material' },
  { label: 'MeshPhongMaterial', insertText: 'new THREE.MeshPhongMaterial({ color: ${1:0x00ff00} })', detail: 'Creates a Phong material' },
  { label: 'MeshStandardMaterial', insertText: 'new THREE.MeshStandardMaterial({ color: ${1:0x00ff00} })', detail: 'Creates a standard material' },
  
  // Mesh
  { label: 'Mesh', insertText: 'new THREE.Mesh(${1:geometry}, ${2:material})', detail: 'Creates a mesh' },
  { label: 'add', insertText: 'scene.add(${1:object})', detail: 'Adds object to scene' },
  { label: 'position.set', insertText: 'position.set(${1:x}, ${2:y}, ${3:z})', detail: 'Sets position' },
  { label: 'rotation.set', insertText: 'rotation.set(${1:x}, ${2:y}, ${3:z})', detail: 'Sets rotation' },
  { label: 'scale.set', insertText: 'scale.set(${1:x}, ${2:y}, ${3:z})', detail: 'Sets scale' },
  
  // Lights
  { label: 'AmbientLight', insertText: 'new THREE.AmbientLight(${1:0x404040}, ${2:0.5})', detail: 'Creates ambient light' },
  { label: 'DirectionalLight', insertText: 'new THREE.DirectionalLight(${1:0xffffff}, ${2:1})', detail: 'Creates directional light' },
  { label: 'PointLight', insertText: 'new THREE.PointLight(${1:0xffffff}, ${2:1}, ${3:100})', detail: 'Creates point light' },
  { label: 'SpotLight', insertText: 'new THREE.SpotLight(${1:0xffffff}, ${2:1})', detail: 'Creates spot light' },
  
  // Vectors
  { label: 'Vector3', insertText: 'new THREE.Vector3(${1:x}, ${2:y}, ${3:z})', detail: 'Creates a 3D vector' },
  { label: 'Vector2', insertText: 'new THREE.Vector2(${1:x}, ${2:y})', detail: 'Creates a 2D vector' },
  
  // Math
  { label: 'MathUtils.degToRad', insertText: 'THREE.MathUtils.degToRad(${1:degrees})', detail: 'Converts degrees to radians' },
  { label: 'MathUtils.radToDeg', insertText: 'THREE.MathUtils.radToDeg(${1:radians})', detail: 'Converts radians to degrees' },
  { label: 'MathUtils.lerp', insertText: 'THREE.MathUtils.lerp(${1:start}, ${2:end}, ${3:alpha})', detail: 'Linear interpolation' },
];

// Custom RNG completions
const rngCompletions = [
  { label: 'random', insertText: 'random()', detail: 'Seeded random number [0, 1)' },
  { label: 'randomRange', insertText: 'randomRange(${1:min}, ${2:max})', detail: 'Seeded random number in range' },
  { label: 'randomInt', insertText: 'randomInt(${1:min}, ${2:max})', detail: 'Seeded random integer' },
  { label: 'choice', insertText: 'choice(${1:array})', detail: 'Seeded random choice from array' },
  { label: 'shuffle', insertText: 'shuffle(${1:array})', detail: 'Seeded array shuffle' },
];

// Animation completions
const animationCompletions = [
  { label: 'animateTime', insertText: 'animateTime()', detail: 'Current animation time [0, 1]' },
  { label: 'animateFrame', insertText: 'animateFrame()', detail: 'Current animation frame number' },
  { label: 'animateValue', insertText: 'animateValue(${1:start}, ${2:end})', detail: 'Animate between two values' },
  { label: 'animateSin', insertText: 'animateSin(${1:frequency}, ${2:amplitude}, ${3:offset})', detail: 'Animated sine wave' },
  { label: 'animateCos', insertText: 'animateCos(${1:frequency}, ${2:amplitude}, ${3:offset})', detail: 'Animated cosine wave' },
];

// Parameter comment templates
const parameterTemplates = [
  { 
    label: '@param number', 
    insertText: '// @param {number} ${1:paramName} - ${2:description} [min=${3:0}, max=${4:100}, step=${5:1}]',
    detail: 'Number parameter with range'
  },
  { 
    label: '@param boolean', 
    insertText: '// @param {boolean} ${1:paramName} - ${2:description} [default=${3:false}]',
    detail: 'Boolean parameter'
  },
  { 
    label: '@param color', 
    insertText: '// @param {color} ${1:paramName} - ${2:description} [default=${3:#ff0000}]',
    detail: 'Color parameter'
  },
  { 
    label: '@param select', 
    insertText: '// @param {select} ${1:paramName} - ${2:description} [options=${3:option1,option2,option3}]',
    detail: 'Select parameter with options'
  },
  { 
    label: '@param vector2', 
    insertText: '// @param {vector2} ${1:paramName} - ${2:description} [default=${3:0,0}, step=${4:0.1}]',
    detail: '2D vector parameter'
  },
  { 
    label: '@param vector3', 
    insertText: '// @param {vector3} ${1:paramName} - ${2:description} [default=${3:0,0,0}, step=${4:0.1}]',
    detail: '3D vector parameter'
  },
  { 
    label: '@param range', 
    insertText: '// @param {range} ${1:paramName} - ${2:description} [default=${3:0,100}, step=${4:1}]',
    detail: 'Range parameter'
  },
];

// Function to create completion provider
export function createCompletionProvider(monaco: typeof Monaco, projectType: 'p5' | 'three') {
  return {
    provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      let suggestions: Monaco.languages.CompletionItem[] = [];

      // Add parameter templates
      suggestions = suggestions.concat(parameterTemplates.map(template => ({
        label: template.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: template.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: template.detail,
        range
      })));

      // Add RNG functions
      suggestions = suggestions.concat(rngCompletions.map(completion => ({
        label: completion.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: completion.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: completion.detail,
        range
      })));

      // Add animation functions
      suggestions = suggestions.concat(animationCompletions.map(completion => ({
        label: completion.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: completion.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: completion.detail,
        range
      })));

      // Add project-specific completions
      const projectCompletions = projectType === 'p5' ? p5Completions : threeCompletions;
      suggestions = suggestions.concat(projectCompletions.map(completion => ({
        label: completion.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: completion.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: completion.detail,
        range
      })));

      return { suggestions };
    }
  };
}

// Function to create hover provider
export function createHoverProvider(monaco: typeof Monaco, projectType: 'p5' | 'three') {
  const allCompletions = [...rngCompletions, ...animationCompletions, ...(projectType === 'p5' ? p5Completions : threeCompletions)];
  
  return {
    provideHover: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const completion = allCompletions.find(c => c.label === word.word);
      if (!completion) return null;

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${completion.label}**` },
          { value: completion.detail }
        ]
      };
    }
  };
}