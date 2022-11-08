import { defineMessages } from 'react-intl';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';
import { MaterialFormData } from 'types/course/material/folders';

import useTranslation from 'lib/hooks/useTranslation';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';

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
    id: 'course.materials.folders.editMaterialTitle',
    defaultMessage: 'Edit Material',
  },
  materialEditSuccess: {
    id: 'course.materials.folders.materialEditSuccess',
    defaultMessage: 'File has been edited',
  },
  materialEditFailure: {
    id: 'course.materials.folders.materialEditFailure',
    defaultMessage: 'File could not be edited',
  },
});

const MaterialEdit: FC<Props> = (props) => {
  const { isOpen, onClose, folderId, materialId, initialValues } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (data: MaterialFormData, setError): void => {
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
  };

  if (!isOpen) {
    return null;
  }

  return (
    <MaterialForm
      open={isOpen}
      editing
      onClose={onClose}
      onSubmit={handleSubmit}
      title={t(translations.editMaterialTitle)}
      initialValues={initialValues}
    />
  );
};

export default MaterialEdit;
