import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import { StairViz } from './stairViz.js';
import { generateJobData } from './utils.js';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 25, 0); // Position camera above the helix for top-down view
camera.lookAt(0, 0, 0); // Look down at the center

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

new THREE.CubeTextureLoader().setPath('/skybox/').load([
  'skybox_right.png', 'skybox_left.png',
  'skybox_up.png', 'skybox_down.png',
  'skybox_front.png', 'skybox_back.png'
], tex => {
  scene.background = tex;
  scene.environment = tex;
});

// Enhanced lighting for helix structure
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Enable shadow mapping on renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 2.5; // Limit to prevent going below the helix
controls.minDistance = 15; // Minimum zoom distance
controls.maxDistance = 50; // Maximum zoom distance

// Overlay messages
const infoDiv = document.createElement('div');
infoDiv.style.cssText = 'position:absolute;top:10px;left:10px;color:white;font:16px sans-serif;';
infoDiv.innerHTML = `👨‍💼 AI is coming to replace you... “CEOs” hit hardest.`;
document.body.appendChild(infoDiv);

const detailDiv = document.createElement('div');
detailDiv.style.cssText = `
  position: fixed;
  background: white;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  border-radius: 8px;
  font-family: sans-serif;
  display: none;
  z-index: 1000;
  min-width: 250px;
  max-width: 300px;
`;
document.body.appendChild(detailDiv);

// Close button
const closeBtn = document.createElement('button');
closeBtn.textContent = '✖';
closeBtn.style.cssText = `
  position: absolute; top: 5px; right: 10px;
  background: none; border: none; font-size: 16px; cursor: pointer;
`;
detailDiv.appendChild(closeBtn);
closeBtn.onclick = () => { detailDiv.style.display = 'none'; };

const popupContent = document.createElement('div');
detailDiv.appendChild(popupContent);

// GUI
const settings = {
  idleWalk: 0,
  impactScale: 1.0,
  colorMode: 'heatmap',
  autoRotate: false,
  randomize: () => {
    scene.remove(viz.group);
    data = generateJobData();
    viz = new StairViz(scene, data, settings);
  }
};
const gui = new GUI();
gui.add(settings, 'idleWalk', 0, 1, 0.01).name('Idle ↔ Walk');
gui.add(settings, 'impactScale', 0.5, 2).onChange(() => {
  scene.remove(viz.group);
  viz = new StairViz(scene, data, settings);
});
gui.add(settings, 'colorMode', ['heatmap','grayscale']).onChange(() => {
  scene.remove(viz.group);
  viz = new StairViz(scene, data, settings);
});
gui.add(settings, 'autoRotate');
gui.add(settings, 'randomize');

// Data & staircase
let data = generateJobData();
let viz = new StairViz(scene, data, settings);

// Raycasting setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('pointerdown', onPointerDown);

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // Only intersect with the interactive blocks, not the decorative lines
  const hits = raycaster.intersectObjects(viz.interactiveGroup.children, false);
  if (hits.length > 0) {
    const block = hits[0].object;
    animateBlock(block);
    showDetails(block.userData, block);
  }
}

function animateBlock(block) {
  const orig = block.scale.clone();
  const target = orig.clone().multiplyScalar(1.3);
  let t = 0;
  const dur = 0.3;

  function grow() {
    t += 0.05;
    block.scale.lerpVectors(orig, target, t / dur);
    if (t < dur) requestAnimationFrame(grow);
    else setTimeout(shrink, 200);
  }
  function shrink() {
    t = 0;
    function down() {
      t += 0.05;
      block.scale.lerpVectors(target, orig, t / dur);
      if (t < dur) requestAnimationFrame(down);
    }
    down();
  }
  grow();
}

let selectedBlock = null;
let selectedBlockTopFace = null;
let popupMesh = null;

function createPopupMesh({ role, impact, description }) {
  const width = 350, height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 12;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);

  // Title
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#222';
  ctx.fillText(role, 20, 36);

  // Impact
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText(`AI Impact: ${impact.toFixed(1)}%`, 20, 65);

  // Description
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText('Description:', 20, 95);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(description, 20, 115);

  // Disruption
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(
    `This role is projected to experience ${impact > 50 ? 'high' : impact > 25 ? 'moderate' : 'low'} disruption due to AI technologies.`,
    20, 145
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const aspect = width / height;
  const planeHeight = 2.2;
  const planeWidth = planeHeight * aspect;
  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

  return new THREE.Mesh(geometry, material);
}

function showDetails({ role, impact, description }, block) {
  // Remove previous popup mesh if any
  if (popupMesh) {
    scene.remove(popupMesh);
    popupMesh.material.map.dispose();
    popupMesh.material.dispose();
    popupMesh.geometry.dispose();
    popupMesh = null;
  }

  // Get block position and top face
  const blockPosition = new THREE.Vector3();
  block.getWorldPosition(blockPosition);
  const blockHeight = block.geometry.parameters.height * block.scale.y;
  const topFaceCenter = blockPosition.clone().add(new THREE.Vector3(0, blockHeight / 2, 0));

  // Create and position popup mesh
  popupMesh = createPopupMesh({ role, impact, description });
  popupMesh.position.copy(topFaceCenter);
  popupMesh.position.y += 1.1; // offset so popup sits just above the block
  scene.add(popupMesh);

  // Make the clicked block white
  const originalColor = block.material.color.clone();
  block.material.color.setHex(0xffffff);

  // Remove popup and restore color on click anywhere
  function removePopup(e) {
    // Only remove if click is not on the popup itself
    if (popupMesh) {
      scene.remove(popupMesh);
      popupMesh.material.map.dispose();
      popupMesh.material.dispose();
      popupMesh.geometry.dispose();
      popupMesh = null;
    }
    block.material.color.copy(originalColor);
    window.removeEventListener('pointerdown', removePopup);
  }
  window.addEventListener('pointerdown', removePopup);

  // Camera: move to position the block in the center of the screen.
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3();
  camera.getWorldDirection(startLookAt); // Get current lookAt direction
  startLookAt.add(camera.position); // Convert direction to world point

  const targetLookAt = new THREE.Vector3();
  block.getWorldPosition(targetLookAt); // Target lookAt is the center of the block

  // Calculate the direction from the camera to the block's center.
  const directionToBlock = new THREE.Vector3().subVectors(targetLookAt, camera.position).normalize();

  // Calculate the target position for the camera.
  // Move the camera 8 units away from the block along the view direction.
  // We want the camera to look AT the block's center (targetLookAt)
  // So, the camera's new position should be targetLookAt minus some distance along the desired viewing direction.
  // For simplicity, let's maintain a similar distance as before, but ensure the block is centered.

  const desiredDistance = 8; // Distance from camera to the block
  // To center the block, the camera should look directly at it.
  // The target position is 'desiredDistance' units away from the block's center,
  // along the line of sight that will be established.

  // We'll first set the camera to look at the block, then calculate the position.
  // However, for smooth animation, we need a target position first.

  // Let's calculate an ideal camera position.
  // We want the camera to look at targetLookAt.
  // The camera's forward vector should point towards targetLookAt.
  // A simple approach is to place the camera at a fixed offset from the block,
  // and then make it look at the block.

  // New approach:
  // 1. Determine the target look-at point (center of the block).
  // 2. Determine a desired camera offset (e.g., maintain current camera orientation relative to world, or a fixed offset).
  //    Let's try to keep the camera's current Y height and move it in XZ plane to align with the block, then adjust distance.

  const targetPosition = new THREE.Vector3();
  // Get the block's world position
  block.getWorldPosition(targetPosition);

  // We want the camera to look at `targetPosition` (the block's center).
  // To position the block in the center of the screen, the camera's new position
  // should be `targetPosition - (camera.getWorldDirection() * distance)`.
  // However, getWorldDirection() depends on the current camera orientation.
  // We need a stable direction.

  // Let's try positioning the camera a fixed distance away from the block,
  // but in a direction that makes sense (e.g., from its current position, moving towards the block).

  const newCamPos = new THREE.Vector3();
  // Calculate vector from current camera position to the block's center
  const vecToBlock = new THREE.Vector3().subVectors(targetLookAt, startPosition).normalize();
  // Set the new camera position by moving 'desiredDistance' away from the block along this vector (in reverse)
  newCamPos.copy(targetLookAt).addScaledVector(vecToBlock.negate(), desiredDistance);


  let zoomProgress = 0;
  const zoomDuration = 1.2; // seconds

  function zoomToBlock() {
    zoomProgress += 0.015; // Corresponds to roughly 60fps, adjust if clock.getDelta() is used
    const t = Math.min(zoomProgress / zoomDuration, 1);
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Quadratic ease in-out

    camera.position.lerpVectors(startPosition, newCamPos, easeT);
    camera.lookAt(targetLookAt); // Ensure camera always looks at the block's center

    if (zoomProgress < zoomDuration) {
      requestAnimationFrame(zoomToBlock);
    } else {
      // Ensure final state is precise
      camera.position.copy(newCamPos);
      camera.lookAt(targetLookAt);
      // Synchronize OrbitControls target
      if (controls) {
        controls.target.copy(targetLookAt);
        controls.update();
      }
    }
  }
  zoomToBlock();
}

function updatePopupPosition() {
  if (!selectedBlock || !selectedBlockTopFace) return;
  // Always project the top face center to screen
  const screenPosition = selectedBlockTopFace.clone().project(camera);
  const popupScreenX = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
  const popupScreenY = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
  // Offset the popup slightly above the block (in screen space, e.g., 24px)
  detailDiv.style.left = popupScreenX + 'px';
  detailDiv.style.top = (popupScreenY - 24) + 'px';
  detailDiv.style.transform = 'translate(-50%, 0)'; // Center horizontally, no rotation
  detailDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
}

// Soldier animation
let mixer, actions = {}, soldierModel;
/*
new GLTFLoader().load('/models/Soldier.glb', gltf => {
  soldierModel = gltf.scene;
  soldierModel.scale.setScalar(0.5);
  soldierModel.position.set(-(data.length / 2), 0, 0);
  soldierModel.traverse(o => o.castShadow = true);
  scene.add(soldierModel);

  mixer = new THREE.AnimationMixer(soldierModel);
  gltf.animations.forEach(clip => {
    actions[clip.name] = mixer.clipAction(clip);
  });
  actions['Idle']?.play();
  actions['Walk']?.play();
});
*/

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  controls.update();
  if (settings.autoRotate) viz.group.rotation.y += 0.005;
  if (popupMesh) {
    popupMesh.lookAt(camera.position);
  }
  /*
  mixer?.update(dt);
  if (actions['Idle'] && actions['Walk']) {
    actions['Idle'].setEffectiveWeight(1 - settings.idleWalk);
    actions['Walk'].setEffectiveWeight(settings.idleWalk);
  }

  if (soldierModel) {
    const speed = dt * 0.5 * settings.idleWalk;
    soldierModel.position.x += speed;
    soldierModel.position.y = (soldierModel.position.x + data.length / 2) * 0.2;
  }
  */
  updatePopupPosition(); // <-- update popup every frame
  renderer.render(scene, camera);
}
animate();
