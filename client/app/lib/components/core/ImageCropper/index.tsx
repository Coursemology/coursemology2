import { ReactEventHandler, useRef, useState } from 'react';
import useEmitterFactory, { Emits } from 'react-emitter-factory';
import { RotateRight } from '@mui/icons-material';
import { Slider } from '@mui/material';
import ReactCrop, { PercentCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { getImage, centerAspectCrop } from './utils';

const DEFAULT_CROP: PercentCrop = {
  unit: '%',
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

export interface ImageCropperEmitter {
  /**
   * Resets the cropper to allow initial crop to be generated on new `src` load.
   */
  resetImage?: () => void;

  /**
   * Asynchronously generate an image file of the final cropped image.
   */
  getImage?: () => Promise<Blob | undefined>;
}

interface ImageCropperProps extends Emits<ImageCropperEmitter> {
  src?: string;
  alt?: string;
  circular?: boolean;
  grids?: boolean;
  aspect?: number;
  onLoadError?: () => void;
  type?: string;
}

const ImageCropper = (props: ImageCropperProps): JSX.Element => {
  const [crop, setCrop] = useState<PercentCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const generateImage = async (): Promise<Blob | undefined> => {
    if (!imgRef.current || !completedCrop) return undefined;
    return getImage(
      imgRef.current!,
      completedCrop,
      rotation,
      props.type ?? 'image/jpeg',
    );
  };

  const handleImageLoad: ReactEventHandler<HTMLImageElement> = (e) => {
    if (props.aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, props.aspect));
    } else {
      setCrop(DEFAULT_CROP);
    }
  };

  // Must set completedCrop and rotation as dependencies because generateImage
  // captures them as the state changes, except imgRef which persists throughout.
  useEmitterFactory(
    props,
    {
      resetImage: () => setCrop(undefined),
      getImage: () => generateImage(),
    },
    [completedCrop, rotation],
  );

  return (
    <div>
      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop): void => setCrop(percentCrop)}
        onComplete={setCompletedCrop}
        ruleOfThirds={props.grids ?? true}
        circularCrop={props.circular}
        aspect={props.aspect}
        keepSelection
      >
        <img
          ref={imgRef}
          alt={props.alt}
          src={props.src}
          onLoad={handleImageLoad}
          onError={props.onLoadError}
          style={{ transform: `rotate(${rotation}deg)` }}
          className="pointer-events-none select-none"
        />
      </ReactCrop>

      <div className="flex items-center">
        <RotateRight className="mr-8" />

        <Slider
          value={rotation}
          onChange={(_, angle): void => setRotation(angle as number)}
          min={0}
          max={180}
          valueLabelDisplay="auto"
          valueLabelFormat={(degree): string => `${degree}\u00B0`}
        />
      </div>
    </div>
  );
};

export default ImageCropper;
