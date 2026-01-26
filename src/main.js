

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

document.querySelector('a-scene').addEventListener('loaded', () => {
    
    // Sélection des éléments de la scène
    const bouton = document.querySelector('#sphere-bouton');
    const bulletin = document.querySelector('#bulletin-rouge');
    const cube = document.querySelector('#cube1-model');
    const sky = document.querySelector('a-sky');
    const scene = document.querySelector('a-scene');
    const grosseLumiere = document.querySelector('#lumiere-forte');

    bouton.addEventListener('click', () => {
        
        console.log("--- DÉBUT DE LA SÉQUENCE ---");

        // -------------------------------------------------
        // ÉTAPE 1 : IMMÉDIAT (T = 0s)
        // Le bulletin monte et s'allume
        // -------------------------------------------------
        
        // A. Lance l'animation de position
        bulletin.emit('monter');

        // B. Rend le bulletin fluorescent (néon)
        bulletin.setAttribute('material', 'emissiveIntensity', '2.0');

        // C. Allume la lumière rouge attachée au bulletin (pour éclairer la table)
        const lumiereBulletin = bulletin.querySelector('a-light');
        if (lumiereBulletin) {
            lumiereBulletin.setAttribute('intensity', '1.5');
        }


        // -------------------------------------------------
        // ÉTAPE 2 : CHANGEMENT DES MURS (T = 3s)
        // -------------------------------------------------
        setTimeout(() => {
            const mesh = cube.getObject3D('mesh');
            
            if (mesh) {
                const murs = []; // Liste pour stocker les morceaux de mur

                // On transforme le mur en néon orange
                mesh.traverse((node) => {
                    if (node.isMesh) {
                        node.material.map = null;              // Enlève le béton
                        node.material.color.set("#750303");    // Couleur Orange
                        node.material.emissive.set("#750303"); // Lumière Orange
                        node.material.transparent = true;      // Prépare la transparence
                        node.material.opacity = 1.0;
                        node.material.needsUpdate = true;
                        
                        murs.push(node);
                    }
                });

                // Lancement de l'effet stroboscopique (Flashs)
                // Toutes les 100ms, l'intensité change
                const flashInterval = setInterval(() => {
                    const intensite = 1.0 + Math.random() * 0.8; // Entre 1.0 et 1.8
                    murs.forEach(node => {
                        // On ne flash que si le mur est encore visible
                        if(node.material.opacity > 0) {
                            node.material.emissiveIntensity = intensite;
                        }
                    });
                }, 100);

                console.log("Murs activés : Orange + Flashs");

                // -------------------------------------------------
                // ÉTAPE 3 : DISPARITION (T = 3s + 2s = 5s)
                // -------------------------------------------------
                setTimeout(() => {
                    console.log("Début du fondu de disparition...");

                    // Boucle pour réduire l'opacité progressivement
                    const fadeInterval = setInterval(() => {
                        let isFinished = false;

                        murs.forEach(node => {
                            node.material.opacity -= 0.02; // Vitesse de disparition

                            if (node.material.opacity <= 0) {
                                node.material.opacity = 0;
                                isFinished = true;
                            }
                        });

                        // Si totalement invisible, on nettoie
                        if (isFinished) {
                            clearInterval(fadeInterval);  // Stop le fondu
                            clearInterval(flashInterval); // Stop les flashs
                            cube.setAttribute('visible', 'false'); // Cache l'objet
                            console.log("Murs disparus.");
                        }

                    }, 50); // Mise à jour toutes les 50ms


                    // -------------------------------------------------
                    // ÉTAPE 4 : FLASH BLANC / WHITEOUT (T = 5s + 3s = 8s)
                    // -------------------------------------------------
                    setTimeout(() => {
                        
                        // A. Le ciel devient blanc
                        sky.setAttribute('color', '#FFFFFF');

                        // B. Le brouillard devient blanc et envahit tout (near: 0)
                        scene.setAttribute('fog', 'type: linear; color: #FFFFFF; far: 20; near: 0');

                        // 3. EXTINCTION DU SPOT (C'est ici qu'on l'éteint)
                        const spotLight = document.querySelector('#lumiere-spot');
                        if (spotLight) {
                            // On le rend invisible pour supprimer totalement ses ombres
                            spotLight.setAttribute('visible', 'false');
                        }

                        // C. La lumière cachée s'active à fond pour supprimer les ombres
                        if (grosseLumiere) {
                            grosseLumiere.setAttribute('intensity', '4');
                        }
                        // D. ACTIVATION DU SOL MIROIR
                        const solMiroir = document.querySelector('#sol-miroir');
                        if (solMiroir) {
                            solMiroir.setAttribute('visible', 'true');
                            console.log("Sol miroir activé");
                        }

                    }, 3000); // 3 secondes après le début de la disparition

                }, 2000); // 2 secondes après le changement de couleur
            }
        }, 3000); // 3 secondes après le clic initial
    });
});