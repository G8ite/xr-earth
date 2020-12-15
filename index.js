
import * as Lib from './lib.js';

/** The sphere radius */
const SPHERE_RADIUS = 50;

/** The distance of the camera from the sphere */
const CAMERA_DIST = 10;

/** The planet base color */
const PLANET_COLOR = 0x111535;

/** The point color */
const POINT_COLOR = 0xFFFFFF;

/** The background color */
const BACKGROUND_COLOR = 0xFFFFFF;

/** The amount of dot to be generated on the sphere */
const DOT_COUNT = 60000;

/** The center of the planet. */
const PLANET_POSITION = new THREE.Vector3(0, 0, 0);

/** 
 * The texture if the world map.
 * This texture tell us when we
 * need to spawn point on the world.
 */
const WORLD_MAP_IMAGE_PATH = "image/world-map.png";

// The XYZ coordinate of each dot
const positions = [];

// A random identifier for each dot
const rndId = [];

// The country border each dot falls within
const countryIds = [];

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, Lib.GetAspectRatio(), 0.1, 1000 );

camera.position.z = 100//1500;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor(BACKGROUND_COLOR);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xffffff, 0.5);
light.position.set( 1, 1, 1 );
light.castShadow = true;
scene.add( light );

var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add( ambLight );

//Set up shadow properties for the light
light.shadow.mapSize.width  = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near    = 0.5;
light.shadow.camera.far     = 500;


const geometry  = new THREE.SphereGeometry(SPHERE_RADIUS, 50, 50);
const material  = new THREE.MeshStandardMaterial({ color: PLANET_COLOR });
const sphere    = new THREE.Mesh( geometry, material );

sphere.castShadow = false;
sphere.receiveShadow = true;

scene.add( sphere );

const center = new THREE.Vector3();

for (let i = DOT_COUNT; i >= 0; i--) {
  const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
  const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

  const vector = new THREE.Vector3();
  vector.setFromSphericalCoords(SPHERE_RADIUS, phi, theta);
  
  positions.push(vector);
}

Lib.LoadImageData(WORLD_MAP_IMAGE_PATH, (imageData) => {

  const dummy = new THREE.Object3D();

  const new_positions = [];

  const dotGeometry = new THREE.CircleGeometry(0.1, 5);
  const dotMaterial = new THREE.MeshStandardMaterial({color: POINT_COLOR });

  for(const position of positions) {
    
    const uvCoord = Lib.SpherePointToUVCoordinate(position, PLANET_POSITION);
    const pixel   = Lib.SampleImage(uvCoord, imageData);

    // Create dot geometry only when the pixel is black.
    if(pixel.r == 0 && pixel.g == 0 && pixel.b == 0) {
      continue;
    }
    
    let matrix = new THREE.Matrix4();

    // matrix.lookAt(new THREE.Vector3(0, 0, 0), position, new THREE.Vector3(0, 1, 0));
    matrix.makeTranslation(position.x, position.y, position.z);
    matrix.makeScale(1, 1, 1);
    matrices.push(matrix);

    // dotGeometry.lookAt(position);
    // dotGeometry.translate(position.x, position.y, position.z);
    
    // const instance = new THREE.InstancedMesh(dotGeometry, dotMaterial);
    // const mesh = new THREE.Mesh( dotGeometry, dotMaterial );

    // scene.add(mesh);
  }

  const instance = new THREE.InstancedMesh(dotGeometry, dotMaterial, matrices.length);
  
  for(var i = 0; i < matrices.length; i++) {
    instance.setMatrixAt(i, matrices[i]);
    instance.setColorAt(i, new THREE.Color(0xFFFFFF));
  }

  instance.instanceMatrix.needsUpdate = true;

  scene.add(instance);
});

window.addEventListener("resize", () => {
  camera.aspect = GetAspectRatio();
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3(0, 0, 0);

// camera.position.z = SPHERE_RADIUS + CAMERA_DIST;

function animate(time) {

  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
  
}

animate();