import { defineMessages } from 'react-intl';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';
import { FolderFormData } from 'types/course/material/folders';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import FolderForm from '../../components/forms/FolderForm';
import { updateFolder } from '../../operations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folderId: number;
  initialValues: FolderFormData;
}

const translations = defineMessages({
  editSubfolderTitle: {
    id: 'course.materials.folders.editSubfolderTitle',
    defaultMessage: 'Edit Folder',
  },
  folderEditSuccess: {
    id: 'course.materials.folders.folderEditSuccess',
    defaultMessage: 'Folder has been edited',
  },
  folderEditFailure: {
    id: 'course.materials.folders.folderEditFailure',
    defaultMessage: 'Folder could not be edited',
  },
});

const FolderEdit: FC<Props> = (props) => {
  const { isOpen, onClose, folderId, initialValues } = props;
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: FolderFormData, setError): void => {
    dispatch(updateFolder(data, folderId))
      .then(() => {
        onClose();
        toast.success(t(translations.folderEditSuccess));
      })
      .catch((error) => {
        toast.error(t(translations.folderEditFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <FolderForm
      open={isOpen}
      editing
      title={t(translations.editSubfolderTitle)}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
};

export default FolderEdit;
