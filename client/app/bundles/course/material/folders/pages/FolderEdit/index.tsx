import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { FolderFormData } from 'types/course/material/folders';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
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
    id: 'course.material.folders.FolderEdit.editSubfolderTitle',
    defaultMessage: 'Edit Folder',
  },
  folderEditSuccess: {
    id: 'course.material.folders.FolderEdit.folderEditSuccess',
    defaultMessage: 'Folder has been edited',
  },
  folderEditFailure: {
    id: 'course.material.folders.FolderEdit.folderEditFailure',
    defaultMessage: 'Folder could not be edited',
  },
});

const FolderEdit: FC<Props> = (props) => {
  const { isOpen, onClose, folderId, initialValues } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const onSubmit = (data: FolderFormData, setError): Promise<void> =>
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
  if (!isOpen) {
    return null;
  }

  return (
    <FolderForm
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={isOpen}
      title={t(translations.editSubfolderTitle)}
    />
  );
};

export default FolderEdit;
