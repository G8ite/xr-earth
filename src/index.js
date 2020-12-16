import * as THREE from 'three';
import * as Lib from './lib.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

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
var planetColor       = 0xf5f5f5;
var dotColor          = 0xc5c5c5;
var mapColorKey       = 0x725da8;

var planet       = new THREE.SphereGeometry(planetRadius, 50, 50);

const MapTextureUrl = "../res/image/map.png";

/** @type {THREE.InstancedMesh} */
var instance;

/** @type {OrbitControls} */
var controls;

/** @type {THREE.Vector3[]} */
const positions = [];

/**
 * @type {{matrix: THREE.Matrix4, isPartner: boolean, position: THREE.Vector3}[]}
 */
const matrices = [];

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

  const sphereMaterial = new THREE.MeshBasicMaterial({ color: planetColor });
  const sphereObject = new THREE.Mesh(planet, sphereMaterial);

  scene.add(sphereObject);

  Loop();
  
  const dummy = new THREE.Object3D();
  const dotCount = 60000;

  var textureOffset = new THREE.Vector2(0, 0);

  const circleGeometry = new THREE.CircleGeometry(0.25, 5);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: dotColor });

  Lib.LoadImageData(MapTextureUrl, (imageData) => {

    for (let i = dotCount; i >= 0; i--) {
      const phi   = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      const position = new THREE.Vector3().setFromSphericalCoords(60, phi, theta);

      const n = new THREE.Vector3(
        planetCenter.x - position.x,
        planetCenter.y - position.y,
        planetCenter.z - position.z,
      ).normalize();

      const u = Math.atan2(n.x, n.z) / (2 * Math.PI) + 0.5;
      const v = 0.5 + Math.asin(n.y) / Math.PI;

      const indX = (Math.floor(u * imageData.width ) + textureOffset.x) % imageData.width;
      const indY = (Math.floor(v * imageData.height) + textureOffset.y) % imageData.height;

      const index = (indY * imageData.width + indX) * 4;

      const pixel = [
        imageData.data[index    ], // r..
        imageData.data[index + 1], // g..
        imageData.data[index + 2], // b..
        imageData.data[index + 3], // a..
      ];

      const alpha = imageData.data[index + 3];

      if(!alpha) continue;
      
      dummy.position.set(0, 0, 0);
      dummy.lookAt(position);

      dummy.position.set(position.x, position.y, position.z);
      dummy.updateMatrix();

      const pixelColor = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];

      positions.push(position);

      matrices.push({
        matrix: dummy.matrix.clone(), 
        isPartner: (pixelColor == mapColorKey),
        position: position,
      });
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

async function Processing(time) {

  if(instance) {
    for(var i = 0; i < instance.count; i++) {
      const c = (Math.cos((time + i * 0.2) / 1000) + 1) / 2;

      if(!matrices[i].isPartner) continue;

      var matrix = new THREE.Matrix4();
      instance.getMatrixAt(i, matrix);

      var quat = new THREE.Quaternion().setFromRotationMatrix(matrix);
      var dir = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

      var pos = matrices[i].position;
      
      pos.x = dir.x * (planetRadius + c);
      pos.y = dir.y * (planetRadius + c);
      pos.z = dir.z * (planetRadius + c);

      matrix.setPosition(pos)
      instance.setMatrixAt(i, matrix);
    }

    instance.instanceMatrix.needsUpdate = true;
  }
}

async function Loop(time) {
  const delta = time - lastTime;

  requestAnimationFrame(Loop);

  controls.update();
  renderer.render(scene, camera);
}