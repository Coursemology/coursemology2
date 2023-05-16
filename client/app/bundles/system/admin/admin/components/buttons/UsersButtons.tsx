import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { UserMiniEntity } from 'types/users';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import MasqueradeButton from 'lib/components/core/buttons/MasqueradeButton';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';

import { deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: UserMiniEntity;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.admin.UsersButton.deletionSuccess',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.admin.UsersButton.deletionFailure',
    defaultMessage: 'Failed to delete user - {error}',
  },
  deletionConfirm: {
    id: 'system.admin.admin.UsersButton.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  deleteTooltip: {
    id: 'system.admin.admin.UsersButton.deleteTooltip',
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
    <div key={`buttons-${user.id}`} className="whitespace-nowrap">
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
      <MasqueradeButton
        canMasquerade={Boolean(user.canMasquerade)}
        className={`user-masquerade-${user.id} ml-4 p-0`}
        href={user.masqueradePath}
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
