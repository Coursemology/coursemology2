import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import { InstanceMiniEntity } from 'types/system/instances';
import equal from 'fast-deep-equal';
import { toast } from 'react-toastify';
import { deleteInstance } from '../../operations';

interface Props extends WrappedComponentProps {
  instance: InstanceMiniEntity;
}
const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.instance.delete.success',
    defaultMessage: '{name} was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.delete.fail',
    defaultMessage: 'Failed to delete instance - {error}',
  },
  deletionConfirm: {
    id: 'system.admin.instance.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {name}?',
  },
});

const InstancesButtons: FC<Props> = (props) => {
  const { intl, instance } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteInstance(instance.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.deletionSuccess, {
            name: instance.name,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${instance.id}`}>
      {instance.permissions.canDelete && (
        <DeleteButton
          tooltip="Delete Instance"
          className={`instance-delete-${instance.id}`}
          disabled={isDeleting}
          loading={isDeleting}
          onClick={onDelete}
          confirmMessage={intl.formatMessage(translations.deletionConfirm, {
            name: instance.name,
          })}
          sx={styles.buttonStyle}
        />
      )}
    </div>
  );

  return managementButtons;
};

export default memo(injectIntl(InstancesButtons), (prevProps, nextProps) => {
  return equal(prevProps.instance, nextProps.instance);
});
