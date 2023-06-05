import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { InstanceMiniEntity } from 'types/system/instances';

import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { updateInstance } from '../../../operations';

interface InstanceFieldProps {
  for: InstanceMiniEntity;
  field: Extract<keyof InstanceMiniEntity, 'name' | 'host'>;
  link?: string;
}

const translations = defineMessages({
  updateSuccess: {
    id: 'system.admin.admin.InstancesTable.updateSuccess',
    defaultMessage: 'Renamed {field} from {prevValue} to {newValue}',
  },
  updateFailure: {
    id: 'system.admin.admin.InstancesTable.updateFailure',
    defaultMessage:
      'Failed to rename {field} from {prevValue} to {prevValue} - {error}',
  },
});

const InstanceField = (props: InstanceFieldProps): JSX.Element => {
  const { for: instance, field, link } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleFieldUpdate = (newValue: string): Promise<void> => {
    return dispatch(updateInstance(instance.id, { [field]: newValue }))
      .then(() => {
        toast.success(
          t(translations.updateSuccess, {
            field,
            prevValue: instance[field],
            newValue,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.updateFailure, {
            field,
            prevValue: instance[field],
            newValue,
            error: error.response?.data?.errors ?? '',
          }),
        );
        throw error;
      });
  };

  return (
    <InlineEditTextField
      key={instance.id}
      className={`instance_${field}_field_${instance.id}`}
      link={link}
      onUpdate={handleFieldUpdate}
      updateValue={(): void => {}}
      value={instance[field]}
      variant="standard"
    />
  );
};

export default InstanceField;
