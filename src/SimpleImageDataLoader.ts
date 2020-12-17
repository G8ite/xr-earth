/**
 * Load data of an image.
 * @param url - The image url
 * @param onLoaded - Called when the image is loaded.
 */
export default async function LoadImageData(url: string) {

  return new Promise<ImageData>((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = url;

    image.onload = function() {
        const canvas = document.createElement("canvas");
        
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext("2d");

        // TODO: Fix this throw function to show url correctly
        if(!ctx) { 
          reject("Failed to load image data from ${url}: Failed to get 2D context.");
          return;
        }

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);

        resolve(imageData);
    }
  });
  
}