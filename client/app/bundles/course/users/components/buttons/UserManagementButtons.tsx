import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import { CourseUserRowData } from 'types/course/courseUsers';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import equal from 'fast-deep-equal';
import { updateUser, deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: CourseUserRowData;
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
  const { intl, user } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);

  const onSave = (data: CourseUserRowData): Promise<void> => {
    setIsSaving(true);
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
    return dispatch(deleteUser(user.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      });
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${user.id}`}>
      <SaveButton
        tooltip="Save Changes"
        className={`user-save-${user.id}`}
        disabled={isSaving}
        onClick={(): Promise<void> => onSave(user)}
      />
      <DeleteButton
        tooltip="Delete User"
        className={`user-delete-${user.id}`}
        disabled={isSaving}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: sharedConstants.COURSE_USER_ROLES[user.role],
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
