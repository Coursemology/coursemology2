import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { FolderFormData } from 'types/course/material/folders';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
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
    id: 'course.material.folders.FolderNew.newSubfolderTitle',
    defaultMessage: 'New Folder',
  },
  folderCreationSuccess: {
    id: 'course.material.folders.FolderNew.folderCreationSuccess',
    defaultMessage: 'New folder created',
  },
  folderCreationFailure: {
    id: 'course.material.folders.FolderNew.folderCreationFailure',
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
  const dispatch = useAppDispatch();

  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: FolderFormData, setError): Promise<void> =>
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
  return (
    <FolderForm
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={isOpen}
      title={t(translations.newSubfolderTitle)}
    />
  );
};

export default FolderNew;
