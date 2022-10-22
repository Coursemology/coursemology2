import {
  centerCrop,
  makeAspectCrop,
  PercentCrop,
  PixelCrop,
} from 'react-image-crop';

const TO_RADIANS = Math.PI / 180;

export const centerAspectCrop = (
  width: number,
  height: number,
  aspect: number,
): PercentCrop => {
  const aspectCrop = makeAspectCrop(
    { unit: '%', width: 90 },
    aspect,
    width,
    height,
  );

  return centerCrop(aspectCrop, width, height);
};

export const getImage = (
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation: number,
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  const rotateRads = rotation * TO_RADIANS;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  // Move the crop origin to the canvas origin at (0, 0)
  ctx.translate(-cropX, -cropY);

  // Move the canvas origin to the center of the original position
  ctx.translate(centerX, centerY);

  // Rotate arount the canvas origin
  ctx.rotate(rotateRads);

  // Move the center of the image to the canvas origin at (0, 0)
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject()), 'image/jpeg'),
  );
};
