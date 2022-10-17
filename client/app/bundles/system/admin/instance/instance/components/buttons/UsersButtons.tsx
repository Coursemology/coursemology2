import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch } from 'types/store';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import equal from 'fast-deep-equal';
import { toast } from 'react-toastify';
import { InstanceUserMiniEntity } from 'types/system/instance/users';
import { deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: InstanceUserMiniEntity;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.instance.user.delete.success',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.user.delete.fail',
    defaultMessage: 'Failed to delete user - {error}',
  },
  deletionConfirm: {
    id: 'system.admin.instance.user.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  deleteTooltip: {
    id: 'system.admin.instance.user.delete.tooltip',
    defaultMessage: 'Delete User',
  },
  masqueradeTooltip: {
    id: 'system.admin.instance.user.masquerade.tooltip',
    defaultMessage: 'Masquerade',
  },
  masqueradeDisabledTooltip: {
    id: 'system.admin.instance.user.masquerade.disabled.tooltip',
    defaultMessage: 'User not confirmed',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { intl, user } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteUser(user.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const managementButtons = (
    <div key={`buttons-${user.id}`}>
      <DeleteButton
        tooltip={intl.formatMessage(translations.deleteTooltip)}
        className={`user-delete-${user.id} p-0`}
        disabled={isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
      />
    </div>
  );

  return managementButtons;
};

export default memo(
  injectIntl(UserManagementButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.user, nextProps.user);
  },
);
