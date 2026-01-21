import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x608030);

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(1, 1, 4);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUZ
scene.add(new THREE.AmbientLight(0xffffff, 1));

// CREAR EL LOADER, objeto que me permite cargar un modelo GLB
const loader = new GLTFLoader();

// CARGAR MODELO
let guitarra;

loader.load(
  'models/guitarra.glb',
  function (gltf) {
    guitarra = gltf.scene;
    scene.add(guitarra);
  },
  undefined,
  function (error) {
    console.error('Error cargando GLB:', error);
  }
);

// LOOP
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// --- D. CONTROLES (La navegación) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Añade inercia al movimiento (más suave)

// Ajustar si cambian el tamaño de la ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});