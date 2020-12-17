import { CircleGeometry, Color, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry, Vector3 } from 'three';
import LoadImageData from './SimpleImageDataLoader';

export type PlanetParams = {

  /** The planet position (center) */
  center: Vector3,

  /** The planet radius */
  radius: number,
  
  /** The planet color */
  color: Color,

  /** The texture image that contains all non-partner & partner countries */
  textureImageUrl: string,

  /** The color of non-partner countries. */
  nCountryColor: Color,

  /** The color of partner countries. */
  pCountryColor: Color,

  /** The color of the mask of the partner countries.  */
  pCountryColorKey: Color,

  /** The maximum amount of dot that we can spawn on the planet surface. */
  dotCount: number,

  /** The radius of each dots */
  dotRadius: number,

  /** The amount of segments for each dots */
  dotSegments: number,

}

type DotInstance = { 
  /** The dot matrix */
  matrix: Matrix4, 
  /** Indicate if this dot is a part of a partner coutry */
  isPartner: boolean, 
}

export class Planet {
  
  private dotInstancedMesh?: InstancedMesh
  private dotGeometry: CircleGeometry
  private dotMaterial: MeshBasicMaterial
  private textureUrl: string
  private settings: PlanetParams
  private scene: Scene
  private matrices: DotInstance[] = [];

  public mesh: Mesh;

  constructor(params: PlanetParams, scene: Scene) {

    this.settings = params;
    this.dotGeometry = new CircleGeometry(params.dotRadius, params.dotSegments);
    this.dotMaterial = new MeshBasicMaterial({ color: params.nCountryColor });

    this.textureUrl = params.textureImageUrl;

    const material = new MeshBasicMaterial({ color: params.color });
    const planetGeometry = new SphereGeometry(params.radius, 50, 50);

    this.mesh = new Mesh(planetGeometry, material);

    this.scene = scene;

    this.LoadDots();
  }

  LoadDots() {
    LoadImageData(this.textureUrl)
      .then((imageData) => this.BuildDots(imageData))
      .catch(console.error)
  }

  BuildDots(from: ImageData) {

    let dummy = new Object3D();

    this.matrices = [];

    for (let i = this.settings.dotCount; i >= 0; i--) {

      const phi   = Math.acos(-1 + (2 * i) / this.settings.dotCount);
      const theta = Math.sqrt(this.settings.dotCount * Math.PI) * phi;

      const position = new Vector3().setFromSphericalCoords(this.settings.radius + 0.25, phi, theta);

      const direction = this.settings.center.sub(position).normalize();

      const u = Math.atan2(direction.x, direction.z) / (2 * Math.PI) + 0.5;
      const v = 0.5 + Math.asin(direction.y) / Math.PI;

      const indX = (Math.floor(u * from.width )) % from.width;
      const indY = (Math.floor(v * from.height)) % from.height;

      const index = (indY * from.width + indX) * 4;

      const pixel = [
        from.data[index    ], // r..
        from.data[index + 1], // g..
        from.data[index + 2], // b..
        from.data[index + 3], // a..
      ];

      const alpha = from.data[index + 3];

      if(!alpha) continue;
      
      dummy.position.set(0, 0, 0);
      dummy.lookAt(position);

      dummy.position.set(position.x, position.y, position.z);
      dummy.updateMatrix();

      const pixelColor = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];

      this.matrices.push({
        matrix: dummy.matrix.clone(), 
        isPartner: pixelColor === this.settings.pCountryColorKey.getHex(),
      });
    }

    this.dotInstancedMesh = new InstancedMesh(this.dotGeometry, this.dotMaterial, this.matrices.length);

    for(var i = 0; i < this.matrices.length; i++) {
      this.dotInstancedMesh.setMatrixAt(i, this.matrices[i].matrix);
      this.dotInstancedMesh.setColorAt(i, this.matrices[i].isPartner ? this.settings.pCountryColor : this.settings.nCountryColor);
    }

    this.scene.add(this.mesh);
    this.scene.add(this.dotInstancedMesh);

  }

}