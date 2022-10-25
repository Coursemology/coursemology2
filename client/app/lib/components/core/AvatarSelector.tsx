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

interface AvatarSelectorProps {
  title: string;
  defaultImageUrl?: string;
  stagedImage?: Blob;
  onSelectImage?: (image: Blob) => void;
  disabled?: boolean;
  circular?: boolean;
}

const AvatarSelector = (props: AvatarSelectorProps): JSX.Element => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<Blob>();
  const [cropping, toggleCropping] = useToggle();

  const selectImage: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    if (!e.target.files || e.target.files.length <= 0) return;

    setSelectedImage(e.target.files[0]);
    toggleCropping();

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
            accept="image/*"
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
          onConfirmImage={props.onSelectImage}
          onLoadError={(): void => {
            setSelectedImage(undefined);
            toast.error(t(messagesTranslations.loadImageError));
          }}
        />
      )}
    </Subsection>
  );
};

export default AvatarSelector;
