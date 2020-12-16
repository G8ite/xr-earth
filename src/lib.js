/**
 * Load data of an image.
 * @param {string} url - The image url
 * @param {(data: ImageData) => void} onLoaded - Called when the image is loaded.
 */
export function LoadImageData(url, onLoaded) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;

  image.onload = function() {
      const canvas = document.createElement("canvas");
      
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0);
      var imageData = ctx.getImageData(0, 0, image.width, image.height);

      onLoaded(imageData);
  }
}