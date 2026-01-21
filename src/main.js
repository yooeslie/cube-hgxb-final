

import AFRAME from "aframe";

// Appliquer la texture béton au modèle Cube1
const cube1Entity = document.getElementById("cube1-model");

cube1Entity.addEventListener("model-loaded", () => {
  const model = cube1Entity.getObject3D("mesh");
  
  if (model) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("./texture/beton.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.shininess = 0;
        child.material.specular = new THREE.Color(0x000000);
        child.material.roughness = 1;
        child.material.metalness = 0;
        child.material.needsUpdate = true;
      }
    });
  }
});

