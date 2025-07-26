export const p5Examples = {
  circles: `// Seeded Random Circles
function setup(p) {
  p.background(20, 20, 30);
  
  // Draw random circles
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
}`,

  maze: `// Generative Maze Pattern
function setup(p) {
  p.background(240);
  p.stroke(60);
  p.strokeWeight(2);
  
  const gridSize = 20;
  
  for (let x = 0; x < p.width; x += gridSize) {
    for (let y = 0; y < p.height; y += gridSize) {
      // Random maze-like pattern
      if (random() > 0.5) {
        p.line(x, y, x + gridSize, y + gridSize);
      } else {
        p.line(x + gridSize, y, x, y + gridSize);
      }
    }
  }
}`,

  particles: `// Seeded Particle System
function setup(p) {
  p.background(0);
  
  const particles = [];
  
  // Create particles
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: randomRange(0, p.width),
      y: randomRange(0, p.height),
      vx: randomRange(-2, 2),
      vy: randomRange(-2, 2),
      size: randomRange(2, 8),
      hue: randomRange(0, 360)
    });
  }
  
  p.colorMode(p.HSB);
  
  // Draw particles
  particles.forEach(particle => {
    p.fill(particle.hue, 80, 90, 180);
    p.noStroke();
    p.circle(particle.x, particle.y, particle.size);
    
    // Connect nearby particles
    particles.forEach(other => {
      const dist = Math.sqrt(
        (particle.x - other.x) ** 2 + 
        (particle.y - other.y) ** 2
      );
      
      if (dist < 80 && dist > 0) {
        p.stroke(particle.hue, 60, 70, 50);
        p.strokeWeight(1);
        p.line(particle.x, particle.y, other.x, other.y);
      }
    });
  });
}`
};

export const threeExamples = {
  cubes: `// Seeded Random Cubes
function setup(scene, camera, renderer) {
  renderer.setClearColor(0x111122);
  
  // Create random cubes
  for (let i = 0; i < 50; i++) {
    const geometry = new THREE.BoxGeometry(
      randomRange(0.1, 0.5),
      randomRange(0.1, 0.5), 
      randomRange(0.1, 0.5)
    );
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        randomRange(0.3, 1),
        randomRange(0.3, 1),
        randomRange(0.5, 1)
      )
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      randomRange(-4, 4),
      randomRange(-4, 4),
      randomRange(-4, 4)
    );
    
    cube.rotation.set(
      randomRange(0, Math.PI * 2),
      randomRange(0, Math.PI * 2),
      randomRange(0, Math.PI * 2)
    );
    
    scene.add(cube);
  }
  
  camera.position.z = 8;
}`,

  spheres: `// Seeded Sphere Cloud
function setup(scene, camera, renderer) {
  renderer.setClearColor(0x000010);
  
  // Create sphere cloud
  for (let i = 0; i < 100; i++) {
    const radius = randomRange(0.05, 0.2);
    const geometry = new THREE.SphereGeometry(radius, 8, 6);
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(
        randomRange(0.6, 0.9), // Blue to purple range
        randomRange(0.5, 1),
        randomRange(0.4, 0.8)
      ),
      transparent: true,
      opacity: randomRange(0.6, 0.9)
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    
    // Position in a rough sphere distribution
    const theta = randomRange(0, Math.PI * 2);
    const phi = randomRange(0, Math.PI);
    const distance = randomRange(2, 6);
    
    sphere.position.set(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.sin(phi) * Math.sin(theta),
      distance * Math.cos(phi)
    );
    
    scene.add(sphere);
  }
  
  camera.position.z = 10;
}`
};