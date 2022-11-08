import { defineMessages } from 'react-intl';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';

import { FolderFormData } from 'types/course/material/folders';
import { toast } from 'react-toastify';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import FolderForm from '../../components/forms/FolderForm';
import { createFolder } from '../../operations';

interface Props {
  folderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  newSubfolderTitle: {
    id: 'course.materials.folders.newSubfolderTitle',
    defaultMessage: 'New Folder',
  },
  folderCreationSuccess: {
    id: 'course.materials.folders.folderCreationSuccess',
    defaultMessage: 'New folder created',
  },
  folderCreationFailure: {
    id: 'course.materials.folders.folderCreationFailure',
    defaultMessage: 'Folder could not be created',
  },
});

const initialValues = {
  name: '',
  description: '',
  canStudentUpload: false,
  startAt: new Date(),
  endAt: null,
};

const FolderNew: FC<Props> = (props) => {
  const { folderId, isOpen, onClose } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: FolderFormData, setError): void => {
    dispatch(createFolder(data, folderId))
      .then(() => {
        onClose();
        toast.success(t(translations.folderCreationSuccess));
      })
      .catch((error) => {
        toast.error(t(translations.folderCreationFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <FolderForm
      open={isOpen}
      editing={false}
      title={t(translations.newSubfolderTitle)}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
};

export default FolderNew;
