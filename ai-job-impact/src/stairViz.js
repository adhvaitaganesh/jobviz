import * as THREE from 'three';

export class StairViz {
  constructor(scene, data, settings = {}) {
    this.group = new THREE.Group();
    this.interactiveGroup = new THREE.Group();
    this.decorativeGroup = new THREE.Group();

    this.group.add(this.interactiveGroup);
    this.group.add(this.decorativeGroup);
    
    // Helix parameters
    const radius = 8; // Radius of the helix
    const heightStep = 0.8; // Vertical step between levels
    const angleStep = Math.PI / 6; // Angular step (30 degrees)
    const blockSize = 1.2; // Size of each block
    
    // Store positions for thread creation
    const positions = [];
    
    // Create helix structure
    data.forEach((item, idx) => {
      // Calculate position on helix
      const angle = idx * angleStep;
      const height = idx * heightStep;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = height;
      
      positions.push(new THREE.Vector3(x, y, z));
      
      // Create block geometry
      const geometry = new THREE.BoxGeometry(blockSize, blockSize * 0.3, blockSize);
      const impactRatio = item.impact / 100;
      
      // Create material with impact-based color
      const material = new THREE.MeshStandardMaterial({ 
        color: settings.colorMode === 'grayscale' 
          ? new THREE.Color(impactRatio * 0.8, impactRatio * 0.8, impactRatio * 0.8)
          : new THREE.Color(`hsl(${(1 - impactRatio) * 120},70%,60%)`),
        roughness: 0.3,
        metalness: 0.1
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position and rotate block
      mesh.position.set(x, y, z);
      mesh.rotation.y = angle; // Rotate block to face outward
      
      // Scale based on impact
      const scaleFactor = 0.5 + (impactRatio * 0.8);
      mesh.scale.setScalar(scaleFactor);
      
      // Enable shadows
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Store data
      mesh.userData = item;
      
      this.interactiveGroup.add(mesh); // Add blocks to interactiveGroup
    });
    
    // Create simple connecting lines between blocks
    this.createConnectingLines(this.decorativeGroup, positions); // Pass decorativeGroup
    
    scene.add(this.group); // Add the main group to the scene
  }
  
  createConnectingLines(decorativeGroup, positions) { // Accept group as parameter
    // Add connecting lines between adjacent blocks
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      
      // Create line geometry
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        linewidth: 3,
        transparent: true,
        opacity: 0.8
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      decorativeGroup.add(line); // Add to the passed-in group
    }
    
    // Add a simple helical curve for visual emphasis
    const curvePoints = [];
    const segments = 100;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * (positions.length - 1) * (Math.PI / 6);
      const height = t * (positions.length - 1) * 0.8;
      const x = 8 * Math.cos(angle);
      const z = 8 * Math.sin(angle);
      const y = height;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({
      color: 0x444444,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    });
    
    const curve = new THREE.Line(curveGeometry, curveMaterial);
    decorativeGroup.add(curve); // Add to the passed-in group
  }
}
