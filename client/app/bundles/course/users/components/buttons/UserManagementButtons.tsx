import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import { CourseUserData } from 'types/course/course_users';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { updateUser, deleteUser } from '../../operations';

interface Props {
  user: CourseUserData;
  intl?: any;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.user.delete.success',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'course.user.delete.fail',
    defaultMessage: 'Failed to delete user.',
  },
  deletionConfirm: {
    id: 'course.user.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
  },
  updateSuccess: {
    id: 'course.user.update.success',
    defaultMessage: 'Record for {name} was updated.',
  },
  updateFailure: {
    id: 'course.user.update.fail',
    defaultMessage: 'Failed to update user. {error}',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { user, intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = (data: CourseUserData): Promise<void> => {
    setIsSaving(true);
    console.log('my user is ', data);
    return dispatch(updateUser(user.id, data))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.updateSuccess, {
            name: user.name,
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

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <SaveButton
        className={`user-save-${user.id}`}
        disabled={isDeleting || isSaving}
        onClick={() => onSave(user)}
      />
      <DeleteButton
        className={`user-delete-${user.id}`}
        disabled={isDeleting || isSaving}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: user.role,
          name: user.name,
          email: user.email,
        })}
      />
    </div>
  );

  return managementButtons;
};

export default injectIntl(UserManagementButtons);
