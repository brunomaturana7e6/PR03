import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x608030);

let objetoSeleccionado = null;
let materialOriginal = null;

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.set(1, 1, 4);

const cameraDirection = new THREE.Vector3(0, 1, 1);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUZ
// --- B. LUCES  ---
// Luz ambiental (ilumina todo suavemente)
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

// Luz direccional (como el sol)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

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

const cuerdas = ["Cuerda1", "Cuerda2", "Cuerda3", "Cuerda4", "Cuerda5", "Cuerda6"];

const sonidosCuerdas = {
  Cuerda1: new Audio('audio/Cuerda1.mp3'),
  Cuerda2: new Audio('audio/Cuerda2.mp3'),
  Cuerda3: new Audio('audio/Cuerda3.mp3'),
  Cuerda4: new Audio('audio/Cuerda4.mp3'),
  Cuerda5: new Audio('audio/Cuerda5.mp3'),
  Cuerda6: new Audio('audio/Cuerda6.mp3')
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick);

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(guitarra.children, true);

  if (intersects.length > 0) {
    const objeto = intersects[0].object;
    const nombre = objeto.name;

    if (cuerdas.includes(nombre)) {
      console.log("Cuerda pulsada:", nombre);
      const audio = sonidosCuerdas[nombre];
      if (audio) {
        audio.currentTime = 0; // Reinicia el audio si estaba sonando
        audio.play();
      }
      return; // Sale de la función, no hace zoom ni highlight
    }

    console.log('Has pulsado:', nombre);

    highlightObject(objeto);
    focusOnObject(objeto);
    mostrarInfo(nombre);
  }
}

function highlightObject(obj) {
  if (objetoSeleccionado) {
    objetoSeleccionado.material = materialOriginal;
  }

  objetoSeleccionado = obj;
  materialOriginal = obj.material;

  obj.material = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.5
  });
}

function focusOnObject(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());

  let distance = zoomPorParte[obj.name] ?? 1;

  const direction = cameraDirection.clone().normalize();
  const newPos = center.clone().add(direction.multiplyScalar(distance));

  // ❌ cancelar animaciones anteriores
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);

  gsap.to(camera.position, {
    x: newPos.x,
    y: newPos.y,
    z: newPos.z,
    duration: 1,
    ease: "power2.out",
    onUpdate: () => {
      camera.lookAt(center);
    }
  });

  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 1,
    ease: "power2.out",
    onUpdate: () => {
      controls.update();
    }
  });
}

const zoomPorParte = {
  Cuerpo: 1,
  Mastil: 1,
  Trastes: 0.2,
  Cylinder001: 0.2,
  Cylinder001_1: 0.2,
  Perillas: 0.3,
  Puente: 0.2,
  Cube: 0.2,
  Cube_1: 0.2,
  Clavijeros: 0.2,
  Cejuela: 0.2,
  Tremolo: 0.3,
  TremoloTapa: 0.3,
  Golpeador: 0.5,
  Inlays: 0.1
};

const panelinfo = document.getElementById('panelinfo');
const infotitulo = document.getElementById('infotitulo');
const infotexto = document.getElementById('infotexto');
const botoncerrar = document.getElementById('botoncerrar');

botoncerrar.addEventListener('click', () => {
  gsap.to(panelinfo, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => panelinfo.style.display = 'none'
  });
});

const infoGuitarra = {
  Cejuela: {
    title: "Cejuela",
    text: "La cejuela sostiene las cuerdas en la parte superior del mástil para guiarlas."
  },
  Cube: {
    title: "Clavijas",
    text: "Las clavijas permiten ajustar la tensión de las cuerdas al girar y, por lo tanto, afinar tu instrumento."
  },
  Cube_1: {
    title: "Clavijas",
    text: "Las clavijas permiten ajustar la tensión de las cuerdas al girar y, por lo tanto, afinar tu instrumento."
  },
  Clavijeros: {
    title: "Clavijeros",
    text: "Aquí es donde sujetan las cuerdas y permiten su afinación mediante el giro de las clavijas."
  },
  Cuerpo: {
    title: "Cuerpo",
    text: "El cuerpo de la guitarra es la parte principal y más grande, fundamental para producir, amplificar y dar forma al sonido."
  },
  Golpeador: {
    title: "Golpeador",
    text: "El golpeador es lo que protege el cuerpo de la guitarra de los arañazos causados al tocar con púa."
  },
  Inlays: {
    title: "Inlays",
    text: "Los inlays son decoraciones que se colocan en la superficie del mástil para marcar las posiciones de las notas como guía visual."
  },
  Mastil: {
    title: "Mástil",
    text: "El mástil de la guitarra es un componente estructural y musical esencial que sostiene las cuerdas y el diapasón, permitiendo al músico formar acordes y melodías al pulsar los trastes."
  },
  Cylinder001: {
    title: "Pastillas",
    text: "Las pastillas son componentes electrónicos que capturan las vibraciones de las cuerdas y las convierten en señales eléctricas que amplifican el sonido."
  },
  Cylinder001_1: {
    title: "Pastillas",
    text: "Las pastillas son componentes electrónicos que capturan las vibraciones de las cuerdas y las convierten en señales eléctricas que amplifican el sonido."
  },
  Perillas: {
    title: "Perillas",
    text: "Las perillas controlan el volumen y el tono de la guitarra."
  },
  Puente: {
    title: "Puente",
    text: "El puente sostiene las cuerdas y transmite sus vibraciones al cuerpo de la guitarra para producir sonido."
  },
  Trastes: {
    title: "Trastes",
    text: "Los trastes son los puntos donde se coloca el dedo para cambiar la longitud de las cuerdas y así afinar la guitarra para producir notas musicales."
  },
  Tremolo: {
    title: "Tremolo",
    text: "El tremolo es un sistema móvil accionado por una palanca que altera la tensión de las cuerdas para subir o bajar la afinación de notas y acordes en tiempo real."
  },
  TremoloTapa: {
    title: "Tremolo",
    text: "El tremolo es un sistema móvil accionado por una palanca que altera la tensión de las cuerdas para subir o bajar la afinación de notas y acordes en tiempo real."
  }
};

function mostrarInfo(nombre) {
  console.log("Buscando info de:", nombre);
  console.log("Existe:", infoGuitarra[nombre]);

  if (!infoGuitarra[nombre]) return;

  infotitulo.textContent = infoGuitarra[nombre].title;
  infotexto.textContent = infoGuitarra[nombre].text;

  panelinfo.style.display = 'block';
  gsap.fromTo(panelinfo,
    { opacity: 0 },
    { opacity: 1, duration: 0.4 }
  );
}

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