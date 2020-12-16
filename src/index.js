import * as THREE from 'three';
import * as Lib from './lib.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

window.addEventListener("DOMContentLoaded", OnPageLoaded);

/** 
 * @type {THREE.Scene} 
 */
var scene;

/**
 * @type {THREE.WebGLRenderer}
 */
var renderer;

/**
 * @type {THREE.Camera}
 */
var camera;

var planetRadius = 60;
var planetCenter = new THREE.Vector3();

var backgroundColor   = 0xffffff;
var lightColor        = 0xffffff;
var ambientLightColor = 0xffffff;
var planetColor       = 0xffffff;
var dotColor          = 0xc5c5c5;
var mapColorKey       =0x725da8;

var planet  = new THREE.SphereGeometry(planetRadius, 50, 50);
var light   = new THREE.DirectionalLight(new THREE.Color(lightColor));
var ambientLight = new THREE.AmbientLight(new THREE.Color(ambientLightColor), 0.93);

ambientLight.position.set(-20, -20, -20);

const MapTextureUrl = "../res/image/map.png";//"https://images.ctfassets.net/fzn2n1nzq965/11064gUb2CgTJXKVwAt5J9/297a98a65d04d4fbb979072ce60466ab/map_fill-a78643e8.png";

/** @type {THREE.InstancedMesh} */
var instance;

/** @type {OrbitControls} */
var controls;

/**
 * Called when dom is loaded.
 * @param {Event} ev - Events.
 */
function OnPageLoaded(ev) {

  const canvas = document.querySelector("#canvas");
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(backgroundColor);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 150;

  controls = new OrbitControls(camera, canvas);

  controls.autoRotate       = true;
  controls.autoRotateSpeed  = 0.25;
  controls.rotateSpeed      = 0.25;
  controls.enableDamping    = true;
  controls.enableZoom       = false;

  const sphereObject = new THREE.Mesh(planet, new THREE.MeshPhysicalMaterial({ color: planetColor }))

  light.position.set(20, 20, 20);
  scene.add(sphereObject, ambientLight);

  Loop();

  const matrices = [];
  const dummy = new THREE.Object3D();
  const dotCount = 60000;

  var textureOffset = new THREE.Vector2(0, 0);

  const circleGeometry = new THREE.CircleGeometry(0.25, 5);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: dotColor });

  Lib.LoadImageData(MapTextureUrl, (imageData) => {

    for (let i = dotCount; i >= 0; i--) {
      const phi   = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      const position = new THREE.Vector3(0, 0, 0).setFromSphericalCoords(60, phi, theta);

      const n = new THREE.Vector3(
        0 - position.x,
        0 - position.y,
        0 - position.z,
      ).normalize();

      const u = Math.atan2(n.x, n.z) / (2 * Math.PI) + 0.5;
      const v = 0.5 + Math.asin(n.y) / Math.PI;

      const indX = (Math.floor(u * imageData.width ) + textureOffset.x) % imageData.width;
      const indY = (Math.floor(v * imageData.height) + textureOffset.y) % imageData.height;

      const index = (indY * imageData.width + indX) * 4;

      const pixel = [
        imageData.data[index    ],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3],
      ];

      const alpha = imageData.data[index + 3];

      if(!alpha) continue;
      
      dummy.position.set(0, 0, 0);
      dummy.lookAt(position);

      dummy.position.set(position.x, position.y, position.z);
      dummy.updateMatrix();

      const pixelColor = (pixel[0] << 16) | (pixel[1] << 8) | (pixel[2]);

      matrices.push({ matrix: dummy.matrix.clone(), isPartner: pixelColor == mapColorKey });

    }

    instance = new THREE.InstancedMesh(circleGeometry, circleMaterial, matrices.length);

    for(var i = 0; i < matrices.length; i++) {
      instance.setMatrixAt(i, matrices[i].matrix);
      instance.setColorAt(i, new THREE.Color(matrices[i].isPartner ? 0x9b1178 : dotColor));
    }

    scene.add(instance);
  });
}

var lastTime = 0;
var matrix = new THREE.Matrix4();
// var counter = 0;

function Loop(time) {
    const delta = time - lastTime;
    requestAnimationFrame(Loop);

    // if(instance) {
    //   // instance.getMatrixAt((counter ++) % instance.count, matrix);
    //   for(var i = 0; i < instance.count; i++) {
    //     instance.getMatrixAt(i, matrix);
    //     const r = matrix.extractRotation();
    //     const d = new THREE.Vector3(0, 0, 1).applyMatrix4(r);
    //     const t = new THREE.Vector3().applyMatrix4();
    //     matrix.copyPosition();
    //     // matrix.setPosition(matrix.po);
    //   }
    // }

    controls.update();
    renderer.render(scene, camera);
}