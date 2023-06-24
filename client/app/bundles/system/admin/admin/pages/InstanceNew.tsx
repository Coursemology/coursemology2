import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { InstanceFormData } from 'types/system/instances';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import InstanceForm from '../components/forms/InstanceForm';
import { createInstance } from '../operations';

interface Props {
  open: boolean;
  onClose: () => void;
}
const translations = defineMessages({
  creationSuccess: {
    id: 'system.admin.admin.InstanceNew.creationSuccess',
    defaultMessage: 'New instance {name} ({host}) created!',
  },
  creationFailure: {
    id: 'system.admin.admin.InstanceNew.creationFailure',
    defaultMessage: 'Failed to create new instance.',
  },
});

const InstanceNew: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const onSubmit = (data: InstanceFormData, setError): Promise<void> =>
    dispatch(createInstance(data))
      .then(() => {
        onClose();
        toast.success(
          t(translations.creationSuccess, {
            name: data.name,
            host: data.host,
          }),
        );
      })
      .catch((error) => {
        toast.error(t(translations.creationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  return <InstanceForm onClose={onClose} onSubmit={onSubmit} open={open} />;
};

export default InstanceNew;
