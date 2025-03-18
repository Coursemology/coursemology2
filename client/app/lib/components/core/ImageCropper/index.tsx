import {
  forwardRef,
  ReactEventHandler,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ReactCrop, { PercentCrop, PixelCrop } from 'react-image-crop';
import { RotateRight } from '@mui/icons-material';
import { Slider } from '@mui/material';

import { centerAspectCrop, getImage } from './utils';
import 'react-image-crop/dist/ReactCrop.css';

const DEFAULT_CROP: PercentCrop = {
  unit: '%',
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

export interface ImageCropperRef {
  /**
   * Resets the cropper to allow initial crop to be generated on new `src` load.
   */
  resetImage?: () => void;

  /**
   * Asynchronously generate an image file of the final cropped image.
   */
  getImage?: () => Promise<Blob | undefined>;
}

interface ImageCropperProps {
  src?: string;
  alt?: string;
  circular?: boolean;
  grids?: boolean;
  aspect?: number;
  onLoadError?: () => void;
  type?: string;
}

const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  (props, ref) => {
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
    useImperativeHandle(
      ref,
      () => ({
        resetImage: (): void => setCrop(undefined),
        getImage: (): Promise<Blob | undefined> => generateImage(),
      }),
      [completedCrop, rotation],
    );

    return (
      <div>
        <ReactCrop
          aspect={props.aspect}
          circularCrop={props.circular}
          crop={crop}
          keepSelection
          onChange={(_, percentCrop): void => setCrop(percentCrop)}
          onComplete={setCompletedCrop}
          ruleOfThirds={props.grids ?? true}
        >
          <img
            ref={imgRef}
            alt={props.alt}
            className="pointer-events-none select-none"
            onError={props.onLoadError}
            onLoad={handleImageLoad}
            src={props.src}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </ReactCrop>

        <div className="flex items-center">
          <RotateRight className="mr-8" />

          <Slider
            max={180}
            min={0}
            onChange={(_, angle): void => setRotation(angle as number)}
            value={rotation}
            valueLabelDisplay="auto"
            valueLabelFormat={(degree): string => `${degree}\u00B0`}
          />
        </div>
      </div>
    );
  },
);

ImageCropper.displayName = 'ImageCropper';

export default ImageCropper;
