/* Ericson Sombrea — Portfolio
   3D soldier walking in the hero background (home page only).
   three.js scene layered inside .warfront: above the ruined skyline,
   beneath the vignette + film grain, behind all page content.
   Skips itself on small screens, reduced motion, or when WebGL fails —
   the CSS warzone remains either way. */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const host = document.querySelector(".warfront");

if (!reduced && host && window.innerWidth > 720 && window.WebGLRenderingContext) {
  try {
    boot();
  } catch (e) {
    /* silently keep the CSS-only scene */
  }
}

function boot() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const canvas = renderer.domElement;
  canvas.className = "soldier3d";
  const vignette = host.querySelector(".vignette");
  host.insertBefore(canvas, vignette || null);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    60
  );
  camera.position.set(0, 1.35, 4.6);
  camera.lookAt(0.35, 1.05, 0);

  // Warm sepia battlefield lighting with a cool moonlit rim
  scene.add(new THREE.HemisphereLight(0xd9c3a3, 0x2a231b, 2.4));
  const key = new THREE.DirectionalLight(0xffd9a6, 2.2);
  key.position.set(-2.5, 4, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb0ff, 0.7);
  rim.position.set(2, 3, -3);
  scene.add(rim);

  const clock = new THREE.Clock();
  let mixer = null;

  new GLTFLoader().load(
    "assets/models/Soldier.glb",
    function (gltf) {
      const soldier = gltf.scene;
      soldier.position.set(0.35, 0, 0);
      soldier.rotation.y = Math.PI - 0.35; // facing viewer, angled like a patrol
      scene.add(soldier);

      mixer = new THREE.AnimationMixer(soldier);
      const walk =
        THREE.AnimationClip.findByName(gltf.animations, "Walk") ||
        gltf.animations[0];
      if (walk) mixer.clipAction(walk).play();
    },
    undefined,
    function () {
      /* model failed to load — remove the empty canvas */
      canvas.remove();
      renderer.setAnimationLoop(null);
    }
  );

  let visible = true;
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.setAnimationLoop(function () {
    if (!visible) return;
    const d = clock.getDelta();
    if (mixer) mixer.update(d);
    renderer.render(scene, camera);
  });
}
