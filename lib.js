
/**
 * Get the 1 dimensional array index from 2 dimensionals array index.
 * @param {{x: number, y: number}} xy - The 2 dimensional array index.
 * @param {number} w - The width of the 2 dimensional array.
 * @return {number} The 1 dimensional index.
 */
export function IndexFrom2D(xy, w) {
  return xy.y * w + xy.x;
}

/**
 * Get the screen aspect ratio.
 * @return {number} The aspect ratio.
 */
export function GetAspectRatio() {
  return  window.innerWidth / window.innerHeight;
}

/**
 * Convert point on sphere to his equivalent on uv coordinate.
 * @param {THREE.Vector3} position - The position of the point on a sphere.
 * @param {THREE.Vector3} center - The position of the sphere.
 * @return {{u: number, v: number}} The UV coordinate.
 */
export function SpherePointToUVCoordinate(position, center) {

  // Get the direction of the point to the sphere center.
  const direction = new THREE.Vector3(
    center.x - position.x,
    center.y - position.y,
    center.z - position.z
  ).normalize();

  return {
    u: Math.atan2(direction.x, direction.z) / (2 * Math.PI) + 0.5,
    v: (direction.y * 0.5 + 0.5),// Math.asin(direction.y) / Math.PI,
  }

}

/**
 * Take a sample from an image.
 * @param {{u: number, v: number}} uv - The uv coordinate.
 * @param {ImageData} imageData - The image.
 * @return {{r: number, g: number, b: number, a: number}} The pixel data.
 */
export function SampleImage(uv, imageData) {

  // The 2D index array of the pixel from uv coordinate.
  const position = {
    x: Math.round(uv.u * imageData.width),
    y: Math.round(uv.v * imageData.height),
  }

  // The 1D index array of the pixel.
  const index = IndexFrom2D(position, imageData.width) * 4;

  // The pixel data (with rgba components)
  const pixel = {
    r: imageData.data[index    ],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  }

  return pixel;
}

/**
 * Load an image from url.
 * @param {string} url - The image url.
 * @param {(image: ImageData) => void} completition - Call when the image was loaded.
 */
export function LoadImageData(url, completition) {
  const img = new Image();

  img.crossOrigin = "anonymous";
  img.src = url;

  const canvas  = document.createElement( 'canvas' );
  const context = canvas.getContext( '2d' );

  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;

    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, img.width, img.height);

    completition(imageData);
  }
}