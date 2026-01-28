

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

// =========================================================
// 2. SCÉNARIO INTERACTIF
// =========================================================
document.querySelector('a-scene').addEventListener('loaded', () => {
    
    // Sélection des objets
    const bouton = document.querySelector('#sphere-bouton');
    const bulletin = document.querySelector('#bulletin-rouge');
    
    const cubeOriginal = document.querySelector('#cube1-model'); // Mur Béton
    const fissuresMur = document.querySelector('#fissures-mur'); // Mur Fissures
    
    // Éléments d'ambiance finale
    const sky = document.querySelector('a-sky');
    const scene = document.querySelector('a-scene');
    const grosseLumiere = document.querySelector('#lumiere-forte');
    const spotLight = document.querySelector('#lumiere-spot');
    const solMiroir = document.querySelector('#sol-miroir');
    const pointRouge = document.querySelector('#point-rouge-loin');
    const traitLumiere = document.querySelector('#trait-lumiere');

    bouton.addEventListener('click', () => {
        console.log("--- START SCÉNARIO ---");

        // -------------------------------------------------
        // ÉTAPE 1 : IMMÉDIAT (Bulletin monte + brille)
        // -------------------------------------------------
        bulletin.emit('monter');
        bulletin.setAttribute('material', 'emissiveIntensity', '2.0');
        const lumiereBulletin = bulletin.querySelector('a-light');
        if (lumiereBulletin) {
            lumiereBulletin.setAttribute('intensity', '1.5');
        }


        // -------------------------------------------------
        // ÉTAPE 2 : APPARITION DES FISSURES (T = 3s)
        // -------------------------------------------------
        setTimeout(() => {
            if (fissuresMur) {
                // 1. On rend les fissures visibles
                fissuresMur.setAttribute('material', 'opacity', '1');
                console.log("Fissures !");

                // 2. Clignotement des fissures (Effet lave instable)
                const flashInterval = setInterval(() => {
                    const intensite = 2.0 + Math.random() * 2.0; 
                    let currentOpacity = parseFloat(fissuresMur.getAttribute('material').opacity);
                    
                    if(currentOpacity > 0) {
                         fissuresMur.setAttribute('material', 'emissiveIntensity', intensite);
                    }
                }, 80);

                // -------------------------------------------------
                // ÉTAPE 3 : DISPARITION / FONDU (T = 5s)
                // -------------------------------------------------
                setTimeout(() => {
                    console.log("Fondu de disparition...");

                    // Préparation du mur original pour la transparence
                    const meshOriginal = cubeOriginal.getObject3D('mesh');
                    if(meshOriginal) {
                        meshOriginal.traverse(node => {
                            if(node.isMesh) {
                                node.material.transparent = true;
                                node.material.opacity = 1;
                            }
                        });
                    }

                    let opaciteCourante = 1.0;

                    const fadeInterval = setInterval(() => {
                        opaciteCourante -= 0.05; // Vitesse

                        if (opaciteCourante <= 0) {
                            // FIN DU FONDU
                            opaciteCourante = 0;
                            clearInterval(fadeInterval);
                            clearInterval(flashInterval);
                            
                            // On cache physiquement les murs
                            cubeOriginal.setAttribute('visible', 'false');
                            fissuresMur.setAttribute('visible', 'false');
                        } else {
                            // PENDANT LE FONDU : On réduit l'opacité des deux murs
                            fissuresMur.setAttribute('material', 'opacity', opaciteCourante);
                            if(meshOriginal) {
                                meshOriginal.traverse(node => { if(node.isMesh) node.material.opacity = opaciteCourante; });
                            }
                        }
                    }, 50);

                    // -------------------------------------------------
                    // ÉTAPE 4 : WHITEOUT BLEUTÉ (T = 8s)
                    // -------------------------------------------------
                    setTimeout(() => {
                        const couleurBleutee = '#DBF0FF';

                        // Ambiance
                        sky.setAttribute('color', couleurBleutee);
                        scene.setAttribute('fog', `type: linear; color: ${couleurBleutee}; far: 25; near: 1`);

                        // Lumières
                        if (grosseLumiere) grosseLumiere.setAttribute('intensity', '4');
                        if (spotLight) spotLight.setAttribute('visible', 'false'); // On coupe le spot

                        // Sol Miroir
                        if (solMiroir) solMiroir.setAttribute('visible', 'true');

                        console.log("WHITEOUT FINAL !");

                        // -------------------------------------------------
                        // ÉTAPE 5 : TRAIT DE LUMIÈRE (T = 10s)
                        // -------------------------------------------------
                        setTimeout(() => {
                            
                            // 1. Point rouge au fond
                            if (pointRouge) pointRouge.setAttribute('visible', 'true');

                            // 2. Trait de lumière
                            if (traitLumiere) {
                                traitLumiere.setAttribute('visible', 'true');
                                traitLumiere.emit('arriver');
                            }
                            
                            console.log("Animation finale terminée.");

                        }, 2000); // +2s après whiteout

                    }, 3000); // +3s après début fondu

                }, 2000); // +2s après fissures
            }
        }, 3000); // +3s après clic
    });
});