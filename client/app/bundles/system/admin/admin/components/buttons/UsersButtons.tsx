import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { UserMiniEntity } from 'types/users';
import MasqueradeButton from 'lib/components/buttons/MasqueradeButton';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import equal from 'fast-deep-equal';
import { toast } from 'react-toastify';
import { deleteUser, updateUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: UserMiniEntity;
}

const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.user.delete.success',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'system.admin.user.delete.fail',
    defaultMessage: 'Failed to delete user.',
  },
  deletionConfirm: {
    id: 'system.admin.user.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  updateSuccess: {
    id: 'system.admin.user.update.success',
    defaultMessage: 'Record for {name} was updated.',
  },
  updateFailure: {
    id: 'system.admin.user.update.fail',
    defaultMessage: 'Failed to update user. {error}',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { intl, user } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = (userToSave: UserMiniEntity): Promise<void> => {
    setIsSaving(true);
    return dispatch(updateUser(userToSave.id, userToSave))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.updateSuccess, {
            name: userToSave.name,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: error.message,
          }),
        );
        throw error;
      })
      .finally(() => setIsSaving(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteUser(user.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const handleMasquerade = (userToMasquerade: UserMiniEntity): void => {
    window.location.href = `${userToMasquerade.masqueradePath}`;
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${user.id}`}>
      <SaveButton
        tooltip="Save Changes"
        className={`user-save-${user.id}`}
        disabled={isDeleting || isSaving}
        onClick={(): Promise<void> => onSave(user)}
        sx={styles.buttonStyle}
      />
      <DeleteButton
        tooltip="Delete User"
        className={`user-delete-${user.id}`}
        disabled={isDeleting || isSaving}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: sharedConstants.USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
        sx={styles.buttonStyle}
      />
      <MasqueradeButton
        tooltip="Masquerade"
        className={`user-masquerade-${user.id}`}
        disabled={!user.canMasquerade}
        onClick={(): void => handleMasquerade(user)}
        sx={styles.buttonStyle}
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
