import { FC, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import { CourseUserRowData } from 'types/course/courseUsers';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import equal from 'fast-deep-equal';
import { deleteUser } from '../../operations';

interface Props extends WrappedComponentProps {
  user: CourseUserRowData;
}

const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

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
      .finally(() => {
        setIsDeleting(false);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${user.id}`}>
      <DeleteButton
        tooltip="Delete User"
        className={`user-delete-${user.id}`}
        disabled={isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.deletionConfirm, {
          role: sharedConstants.COURSE_USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
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
