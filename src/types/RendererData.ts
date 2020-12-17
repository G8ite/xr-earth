import { WebGLRenderer, Scene, Camera } from 'three';

type RendererData = { 
  renderer: WebGLRenderer, 
  scene: Scene, 
  camera: Camera 
};

export default RendererData;