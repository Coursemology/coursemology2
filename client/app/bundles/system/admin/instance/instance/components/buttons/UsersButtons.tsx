import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { InstanceUserMiniEntity } from 'types/system/instance/users';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';

import { deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: InstanceUserMiniEntity;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.instance.instance.UsersButton.deletionSuccess',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.instance.instance.UsersButton.deletionFailure',
    defaultMessage: 'Failed to delete user - {error}',
  },
  deletionConfirm: {
    id: 'system.admin.instance.instance.UsersButton.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  deleteTooltip: {
    id: 'system.admin.instance.instance.UsersButton.deleteTooltip',
    defaultMessage: 'Delete User',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { intl, user } = props;
  const dispatch = useAppDispatch();
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

  return (
    <div key={`buttons-${user.id}`}>
      <DeleteButton
        className={`user-delete-${user.id} p-0`}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
        disabled={isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        tooltip={intl.formatMessage(translations.deleteTooltip)}
      />
    </div>
  );
};

export default memo(
  injectIntl(UserManagementButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.user, nextProps.user);
  },
);
