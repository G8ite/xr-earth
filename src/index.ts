import { Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Planet, PlanetParams } from './Planet';
import RendererData from './types/RendererData';

/** The planet settings */
const planetSettings: PlanetParams = {

  center: new Vector3(0, 0, 0),
  radius: 60,

  textureImageUrl: "image/map.png",

  color: new Color(0xf0f0f0),
  nCountryColor: new Color(0xc5c5c5),
  pCountryColor: new Color(0x9b1178),
  pCountryColorKey: new Color(0x725da8),

  dotCount: 60000,
  dotRadius: 0.25,
  dotSegments: 5,

}

/**
 * Camera settings.
 */
const cameraSettings = {
  fov: 45,

  position: new Vector3(0, 0, 180),

  near: 0.1,
  far: 1000,
};

/**
 * Renderer settings.
 */
const rendererSettings = {
  clearColor: new Color(0xffffff),
}

var orbitControls: OrbitControls | null = null;
var planet: Planet | null = null;

// When all DOM is loaded, we call Init()
window.addEventListener("DOMContentLoaded", Init);

/**
 * Initialize webgl renderer and threejs scene.
 * @param event - Envents
 */
function Init(event?: Event) {

  // Try to get the canvas
  const canvas = document.querySelector("#canvas") as (HTMLCanvasElement | null);
  
  // Check if canvas exist
  if(!canvas) throw "Canvas not found!";

  // Create new renderer
  const renderer = new WebGLRenderer({
    antialias: true,
    canvas: canvas,
  });

  // Set the renderer size to full screen
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Set the renderer clear color
  renderer.setClearColor(rendererSettings.clearColor);

  // Create new scene
  const scene = new Scene();

  // Create our main camera
  const camera = new PerspectiveCamera(
    cameraSettings.fov, 
    window.innerWidth / window.innerHeight, 
    cameraSettings.near, 
    cameraSettings.far
  );
  
  // Setup camera position
  camera.position.set(
    cameraSettings.position.x,
    cameraSettings.position.y,
    cameraSettings.position.z
  );

  // Setup renderer data
  const rdata: RendererData = { 
    renderer: renderer, 
    scene: scene, 
    camera: camera 
  };

  // Add event when the window is resized
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );

  // To initialize things before loop
  BeforeLoop(rdata);

  // Start render loop
  Loop(0, rdata);
}

/**
 * This function is called once before render loop start.
 * You can initialize / create data or other things that requierd
 * current scene, current renderer or main camera inside this function.
 * @param data - Renderer data
 */
function BeforeLoop(data: RendererData) {

  // Create and setup orbit controls...
  orbitControls = new OrbitControls(data.camera, data.renderer.domElement);
  orbitControls.autoRotate       = true;
  orbitControls.autoRotateSpeed  = 0.25;
  orbitControls.rotateSpeed      = 0.25;
  orbitControls.enableDamping    = true;
  orbitControls.enableZoom       = false;

  // Init our planet and add it to the scene.
  planet = new Planet(planetSettings, data.scene);
}

/**
 * Render the scene. Must be called each frame.
 * @param time - Time (in ms) since the first call of this function.
 * @param data - Data requierd to render
 */
function Loop(time: number, data: RendererData) {
  requestAnimationFrame((time) => Loop(time, data));

  orbitControls?.update();
  data.renderer.render(data.scene, data.camera);
}