import { defineMessages } from 'react-intl';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from 'types/store';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';
import { InstanceFormData } from 'types/system/instances';
import { createInstance } from '../../operations';
import InstanceForm from '../../components/forms/InstanceForm';

interface Props {
  open: boolean;
  onClose: () => void;
}
const translations = defineMessages({
  creationSuccess: {
    id: 'system.admin.instance.new.creationSuccess',
    defaultMessage: 'New instance {name} ({host}) created!',
  },
  creationFailure: {
    id: 'system.admin.instance.new.creationFailure',
    defaultMessage: 'Failed to create new instance.',
  },
});

const InstanceNew: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data: InstanceFormData, setError): void => {
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
  };

  return <InstanceForm open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default InstanceNew;
