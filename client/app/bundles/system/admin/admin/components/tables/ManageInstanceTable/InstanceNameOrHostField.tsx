import { memo } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { InstanceMiniEntity } from 'types/system/instances';

import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { updateInstance } from '../../../operations';

interface InstanceNameOrHostFieldProps {
  for: InstanceMiniEntity;
  submitting: boolean;
  setSubmitting: (status: boolean) => void;
  nameChanged?: boolean;
}

const translations = defineMessages({
  renameSuccess: {
    id: 'system.admin.admin.InstancesTable.renameSuccess',
    defaultMessage: 'Renamed instance to {name}',
  },
  updateNameFailure: {
    id: 'system.admin.admin.InstancesTable.updateNameFailure',
    defaultMessage: 'Failed to rename instance to {oldName}',
  },
  changeHostSuccess: {
    id: 'system.admin.admin.InstancesTable.changeHostSuccess',
    defaultMessage: 'Host changed from {oldHost} to {newHost}',
  },
  updateHostFailure: {
    id: 'system.admin.admin.InstancesTable.updateRoleFailure',
    defaultMessage: 'Failed to change host from {oldHost} to {newHost}',
  },
});

const InstanceNameOrHostField = (
  props: InstanceNameOrHostFieldProps,
): JSX.Element => {
  const { for: instance, submitting, setSubmitting, nameChanged } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleNameUpdate = (newName: string): Promise<void> => {
    setSubmitting(true);

    return dispatch(updateInstance(instance.id, { name: newName }))
      .then(() => {
        toast.success(
          t(translations.renameSuccess, {
            name: newName,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.updateNameFailure, {
            oldName: instance.name,
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleHostUpdate = (newHost: string): Promise<void> => {
    setSubmitting(true);

    return dispatch(updateInstance(instance.id, { host: newHost }))
      .then(() => {
        toast.success(
          t(translations.changeHostSuccess, {
            oldHost: instance.host,
            newHost,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.updateHostFailure, {
            oldHost: instance.host,
            newHost,
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <InlineEditTextField
      key={instance.id}
      className="instance_name"
      disabled={submitting}
      onUpdate={(newName): Promise<void> => {
        if (nameChanged) {
          return handleNameUpdate(newName);
        }
        return handleHostUpdate(newName);
      }}
      updateValue={(): void => {}}
      value={nameChanged ? instance.name : instance.host}
      variant="standard"
    />
  );
};

export default memo(
  InstanceNameOrHostField,
  (p, n) => equal(p.for.name, n.for.name) && p.submitting === n.submitting,
);
