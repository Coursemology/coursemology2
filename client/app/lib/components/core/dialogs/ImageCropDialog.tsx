import { ComponentProps, useState } from 'react';

import Prompt from 'lib/components/core/dialogs/Prompt';
import ImageCropper, {
  ImageCropperEmitter,
} from 'lib/components/core/ImageCropper';
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
  const [disabled, setDisabled] = useState(false);
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
      disabled={disabled}
      onClickPrimary={(): void => {
        setDisabled(true);
        handleConfirmImage().finally(() => setDisabled(false));
      }}
      onClose={props.onClose}
      open={props.open}
      primaryLabel={t(formTranslations.done)}
      title={props.title}
    >
      <ImageCropper
        alt={props.alt}
        aspect={props.aspect}
        circular={props.circular}
        emitsVia={setImageCropper}
        onLoadError={handleLoadError}
        src={props.src}
        type={props.type}
      />
    </Prompt>
  );
};

export default ImageCropDialog;
