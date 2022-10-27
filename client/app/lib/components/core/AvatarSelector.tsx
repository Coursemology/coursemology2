import { useState, ChangeEventHandler } from 'react';
import { Create } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';
import { toast } from 'react-toastify';

import ImageCropDialog from 'lib/components/core/dialogs/ImageCropDialog';
import Subsection from 'lib/components/core/layouts/Subsection';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';
import translations from 'bundles/user/translations';

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
          src={
            props.stagedImage
              ? URL.createObjectURL(props.stagedImage)
              : props.defaultImageUrl
          }
          className="h-80 w-80"
          variant={props.circular ? 'circular' : 'square'}
        />

        <Button
          variant="outlined"
          component="label"
          disabled={props.disabled}
          startIcon={<Create />}
          size="small"
          className="absolute bottom-4 left-4 bg-white bg-opacity-90"
        >
          {t(translations.changeProfilePicture)}
          <input
            hidden
            type="file"
            accept={IMAGE_MIMES_STRING}
            className="hidden"
            onChange={selectImage}
            disabled={props.disabled}
          />
        </Button>
      </div>

      {selectedImage && (
        <ImageCropDialog
          open={cropping}
          onClose={toggleCropping}
          src={URL.createObjectURL(selectedImage)}
          aspect={1}
          circular={props.circular}
          type={selectedImage.type}
          onConfirmImage={stageImage}
          onLoadError={raiseInvalidImageError}
        />
      )}
    </Subsection>
  );
};

export default AvatarSelector;
