import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';

import { deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: CourseUserMiniEntity;
  disabled?: boolean;
}

const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.users.UserManagementButtons.deletionSuccess',
    defaultMessage: 'User was deleted.',
  },
  deletionFailure: {
    id: 'course.users.UserManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete user.',
  },
  deletionConfirm: {
    id: 'course.users.UserManagementButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete {role} {name} ({email})?',
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
      .finally(() => {
        setIsDeleting(false);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <div key={`buttons-${user.id}`} style={{ whiteSpace: 'nowrap' }}>
      <DeleteButton
        className={`user-delete-${user.id}`}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: COURSE_USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
        disabled={isDeleting || Boolean(props.disabled)}
        loading={isDeleting}
        onClick={onDelete}
        sx={styles.buttonStyle}
        tooltip="Delete User"
      />
    </div>
  );
};

export default memo(injectIntl(UserManagementButtons), equal);
