import { useState } from 'react';

import ImageCropper, {
  ImageCropperEmitter,
} from 'lib/components/core/ImageCropper';
import Prompt from 'lib/components/core/dialogs/Prompt';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface ImageCropDialogProps {
  open: boolean;
  src?: string;
  alt?: string;
  circular?: boolean;
  aspect?: number;
  title?: string;
  onConfirmImage?: (image: Blob) => void;
  onLoadError?: () => void;
  onClose?: () => void;
}

const ImageCropDialog = (props: ImageCropDialogProps): JSX.Element => {
  const { t } = useTranslation();
  const [disabled, toggleDisabled] = useToggle();
  const [imageCropper, setImageCropper] = useState<ImageCropperEmitter>();

  const handleLoadError = (): void => {
    props.onLoadError?.();
    props.onClose?.();
  };

  const handleConfirmImage = async (): Promise<void> => {
    const image = await imageCropper?.getImage?.();
    if (!image) throw new Error(`ImageCropper returned: ${image} image data.`);

    props.onConfirmImage?.(image);
    props.onClose?.();
  };

  return (
    <Prompt
      open={props.open}
      onClose={props.onClose}
      disabled={disabled}
      title={props.title}
      primaryLabel={t(formTranslations.done)}
      onClickPrimary={(): void => {
        toggleDisabled();
        handleConfirmImage().finally(toggleDisabled);
      }}
    >
      <ImageCropper
        src={props.src}
        alt={props.alt}
        circular={props.circular}
        aspect={props.aspect}
        emitsVia={setImageCropper}
        onLoadError={handleLoadError}
      />
    </Prompt>
  );
};

export default ImageCropDialog;
