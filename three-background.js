/* ═══════════════════════════════════════════════════════════════
   EDUMOE v7 — three-background.js
   THREE.JS 3D PARTICLE BACKGROUND
   Code snippets, math equations, circuit symbols floating in sine waves
   ═══════════════════════════════════════════════════════════════ */

let threeScene, threeRenderer, threeCamera, particles = [];
let mouseX = 0, mouseY = 0;
let isMobile = window.innerWidth < 768;
let particleCount = isMobile ? 30 : 70;

// Particle data: text/symbols and colors
const PARTICLE_DATA = [
  // Code snippets
  { text: 'int x = 5;', type: 'code' },
  { text: 'cout << x;', type: 'code' },
  { text: 'for(int i...)', type: 'code' },
  { text: 'void sort()', type: 'code' },
  { text: 'arr[index]', type: 'code' },
  { text: 'if(x > 0)', type: 'code' },
  { text: 'while(true)', type: 'code' },
  { text: 'return 0;', type: 'code' },
  
  // Math equations
  { text: '∫x²dx', type: 'math' },
  { text: 'd/dx sin(x)', type: 'math' },
  { text: '∑ n=1∞', type: 'math' },
  { text: '∇·E = ρ/ε₀', type: 'math' },
  { text: 'lim x→0', type: 'math' },
  { text: 'e^iπ = -1', type: 'math' },
  { text: 'sin²θ + cos²θ', type: 'math' },
  { text: 'E = mc²', type: 'math' },
  
  // Circuit symbols
  { text: 'AND', type: 'circuit' },
  { text: 'OR', type: 'circuit' },
  { text: 'NOT', type: 'circuit' },
  { text: 'XOR', type: 'circuit' },
  { text: 'V = IR', type: 'circuit' },
  { text: 'Ohm\'s Law', type: 'circuit' },
  
  // Physics
  { text: 'F = ma', type: 'physics' },
  { text: 'v = λf', type: 'physics' },
  { text: 'Lenz Law', type: 'physics' },
  { text: 'Gauss Law', type: 'physics' },
  { text: 'B field', type: 'physics' },
  
  // Discrete
  { text: '{a,b,c}', type: 'discrete' },
  { text: '∪', type: 'discrete' },
  { text: '∩', type: 'discrete' },
  { text: '⊆', type: 'discrete' },
];

// Initialize Three.js
function initThree() {
  const canvas = document.getElementById('three-bg-canvas');
  if (!canvas) return; // Canvas not available
  
  // Scene setup
  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  threeCamera.position.z = 100;
  
  // Renderer setup
  threeRenderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setClearColor(0x000000, 0);
  
  // Create canvas texture for text
  const particleTextures = createTextTextures();
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particleData = PARTICLE_DATA[i % PARTICLE_DATA.length];
    const texture = particleTextures[particleData.type];
    
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.3,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Random initial position
    mesh.position.x = (Math.random() - 0.5) * 300;
    mesh.position.y = (Math.random() - 0.5) * 300;
    mesh.position.z = (Math.random() - 0.5) * 150;
    
    // Store particle properties
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.2,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1,
      radius: 50 + Math.random() * 100,
      initialOpacity: material.opacity,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
    
    threeScene.add(mesh);
    particles.push(mesh);
  }
  
  // Start animation loop
  animate();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Track mouse
  if (!isMobile) {
    document.addEventListener('mousemove', onMouseMove);
  }
}

// Create canvas texture for text
function createTextTextures() {
  const textures = {
    code: createTextureFromText('Code', 256, '#4ade80'),
    math: createTextureFromText('∫', 256, '#a78bfa'),
    circuit: createTextureFromText('⚡', 256, '#fbbf24'),
    physics: createTextureFromText('𝔉', 256, '#22d3ee'),
    discrete: createTextureFromText('∪', 256, '#f87171')
  };
  return textures;
}

// Create texture from text
function createTextureFromText(text, size, color) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, size, size);
  
  // Draw text
  ctx.fillStyle = color;
  ctx.font = `bold ${size * 0.4}px 'Courier New'`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, size / 2, size / 2);
  
  // Add glow/blur effect by drawing multiple times
  ctx.globalAlpha = 0.3;
  ctx.fillText(text, size / 2, size / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const time = Date.now() * 0.0005;
  
  particles.forEach((particle, i) => {
    const data = particle.userData;
    
    // Sine wave motion
    const angle = time * data.speed + data.angle;
    const radius = data.radius;
    
    particle.position.x = Math.cos(angle) * radius + (mouseX - window.innerWidth / 2) * 0.05;
    particle.position.y = Math.sin(angle * 0.7) * radius + (mouseY - window.innerHeight / 2) * 0.05;
    particle.position.z = Math.sin(angle * 0.3) * 50;
    
    // Rotation
    particle.rotation.x += data.rotationSpeed;
    particle.rotation.y += data.rotationSpeed * 0.7;
    particle.rotation.z += data.rotationSpeed * 0.5;
    
    // Fade based on distance to camera
    const distToCamera = particle.position.distanceTo(threeCamera.position);
    particle.material.opacity = data.initialOpacity * Math.max(0, 1 - distToCamera / 300);
  });
  
  threeRenderer.render(threeScene, threeCamera);
}

// Handle mouse move
function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Subtle repel effect: particles near cursor are pushed away
  const repelRadius = 150;
  const repelStrength = 2;
  
  particles.forEach((particle) => {
    const dx = particle.position.x - (mouseX - window.innerWidth / 2) * 0.1;
    const dy = particle.position.y - (mouseY - window.innerHeight / 2) * 0.1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < repelRadius) {
      const force = (repelRadius - dist) / repelRadius * repelStrength;
      particle.position.x += (dx / dist) * force;
      particle.position.y += (dy / dist) * force;
    }
  });
}

// Handle window resize
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  
  threeRenderer.setSize(width, height);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThree);
} else {
  initThree();
}

console.log('✅ Three.js background initialized');
