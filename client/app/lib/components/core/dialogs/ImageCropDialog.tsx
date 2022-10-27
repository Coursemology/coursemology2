import { ComponentProps, useState } from 'react';

import ImageCropper, {
  ImageCropperEmitter,
} from 'lib/components/core/ImageCropper';
import Prompt from 'lib/components/core/dialogs/Prompt';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface ImageCropDialogProps {
  open: boolean;
  title?: string;
  onConfirmImage?: (image: Blob) => void;
  onLoadError?: () => void;
  onClose?: () => void;
  src?: ComponentProps<typeof ImageCropper>['src'];
  alt?: ComponentProps<typeof ImageCropper>['alt'];
  circular?: ComponentProps<typeof ImageCropper>['circular'];
  aspect?: ComponentProps<typeof ImageCropper>['aspect'];
  type?: ComponentProps<typeof ImageCropper>['type'];
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
        emitsVia={setImageCropper}
        onLoadError={handleLoadError}
        src={props.src}
        alt={props.alt}
        circular={props.circular}
        aspect={props.aspect}
        type={props.type}
      />
    </Prompt>
  );
};

export default ImageCropDialog;
