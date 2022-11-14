import { ChangeEventHandler, useState } from 'react';
import { toast } from 'react-toastify';
import { Create } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';

import translations from 'bundles/user/translations';
import ImageCropDialog from 'lib/components/core/dialogs/ImageCropDialog';
import Subsection from 'lib/components/core/layouts/Subsection';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';

const IMAGE_MIMES_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};
const IMAGE_MIMES = Object.keys(IMAGE_MIMES_MAP);
const IMAGE_MIMES_SET = new Set(IMAGE_MIMES);
const IMAGE_MIMES_STRING = IMAGE_MIMES.join(', ');

const DEFAULT_IMAGE_NAME = 'image';

interface AvatarSelectorProps {
  title: string;
  defaultImageUrl?: string;
  stagedImage?: File;
  onSelectImage?: (image: File) => void;
  disabled?: boolean;
  circular?: boolean;
}

/**
 * Renders an avatar and a button to choose a new image. Supports JPG, PNG, and
 * GIF. GIFs will skip cropping and immediately be passed to `onSelectImage`.
 */
const AvatarSelector = (props: AvatarSelectorProps): JSX.Element => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<File>();
  const [cropping, toggleCropping] = useToggle();

  const raiseInvalidImageError = (): void => {
    setSelectedImage(undefined);
    toast.error(t(messagesTranslations.loadImageError));
  };

  const stageImage = (image: Blob): void => {
    const extension = IMAGE_MIMES_MAP[image.type];
    if (!extension)
      throw new Error(`Extension for MIME ${image.type} is ${extension}`);

    const fileName = `${DEFAULT_IMAGE_NAME}.${extension}`;
    const file = new File([image], fileName, { type: image.type });

    props.onSelectImage?.(file);
  };

  const selectImage: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    if (!e.target.files || e.target.files.length <= 0) return;

    const file = e.target.files[0];

    if (file.type === 'image/gif') {
      props.onSelectImage?.(file);
    } else if (IMAGE_MIMES_SET.has(file.type)) {
      setSelectedImage(file);
      toggleCropping();
    } else {
      raiseInvalidImageError();
    }

    e.target.value = '';
  };

  return (
    <Subsection title={props.title}>
      <div className="relative">
        <Avatar
          className="h-80 w-80"
          src={
            props.stagedImage
              ? URL.createObjectURL(props.stagedImage)
              : props.defaultImageUrl
          }
          variant={props.circular ? 'circular' : 'square'}
        />

        <Button
          className="absolute bottom-4 left-4 bg-white bg-opacity-90"
          component="label"
          disabled={props.disabled}
          size="small"
          startIcon={<Create />}
          variant="outlined"
        >
          {t(translations.changeProfilePicture)}
          <input
            accept={IMAGE_MIMES_STRING}
            className="hidden"
            disabled={props.disabled}
            hidden
            onChange={selectImage}
            type="file"
          />
        </Button>
      </div>

      {selectedImage && (
        <ImageCropDialog
          aspect={1}
          circular={props.circular}
          onClose={toggleCropping}
          onConfirmImage={stageImage}
          onLoadError={raiseInvalidImageError}
          open={cropping}
          src={URL.createObjectURL(selectedImage)}
          type={selectedImage.type}
        />
      )}
    </Subsection>
  );
};

export default AvatarSelector;
