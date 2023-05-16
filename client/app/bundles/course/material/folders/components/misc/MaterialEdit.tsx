import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { MaterialFormData } from 'types/course/material/folders';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { updateMaterial } from '../../operations';
import MaterialForm from '../forms/MaterialForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folderId: number;
  materialId: number;
  initialValues: {
    name: string;
    description: string;
    file: { name: string; url: string };
  };
}

const translations = defineMessages({
  editMaterialTitle: {
    id: 'course.material.folders.MaterialEdit.editMaterialTitle',
    defaultMessage: 'Edit Material',
  },
  materialEditSuccess: {
    id: 'course.material.folders.MaterialEdit.materialEditSuccess',
    defaultMessage: 'File has been edited',
  },
  materialEditFailure: {
    id: 'course.material.folders.MaterialEdit.materialEditFailure',
    defaultMessage: 'File could not be edited',
  },
});

const MaterialEdit: FC<Props> = (props) => {
  const { isOpen, onClose, folderId, materialId, initialValues } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleSubmit = (data: MaterialFormData, setError): Promise<void> =>
    dispatch(updateMaterial(data, folderId, materialId))
      .then(() => {
        onClose();
        toast.success(t(translations.materialEditSuccess));
      })
      .catch((error) => {
        toast.error(t(translations.materialEditFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  if (!isOpen) {
    return null;
  }

  return (
    <MaterialForm
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={isOpen}
      title={t(translations.editMaterialTitle)}
    />
  );
};

export default MaterialEdit;
