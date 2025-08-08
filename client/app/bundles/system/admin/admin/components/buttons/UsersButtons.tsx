import { FC, memo, useState } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { UserMiniEntity } from 'types/users';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteUser } from '../../operations';

interface Props {
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
  deletionConfirmTitle: {
    id: 'system.admin.admin.UsersButton.deletionConfirmTitle',
    defaultMessage: 'Deleting {role} User {name} ({email})',
  },
  deletionPromptContent: {
    id: 'system.admin.admin.UsersButton.deletionPromptContent',
    defaultMessage:
      'Deleting this user will PERMANENTLY delete associated data in the following {count, plural, one {course} other {courses}}:',
  },
  associatedCourses: {
    id: 'system.admin.admin.UsersButton.associatedCourses',
    defaultMessage: '{courseName} ({instanceName})',
  },
  deletionConfirm: {
    id: 'system.admin.admin.UsersButton.deletionConfirm',
    defaultMessage: 'Are you sure you wish to proceed?',
  },
  deleteTooltip: {
    id: 'system.admin.admin.UsersButton.deleteTooltip',
    defaultMessage: 'Delete User',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { user } = props;
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  const userCoursesWithInstanceNames = user.instances.flatMap((instance) =>
    instance.courses.map((course) => ({
      ...course,
      instanceName: instance.name,
    })),
  );

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteUser(user.id))
      .then(() => {
        toast.success(t(translations.deletionSuccess));
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.deletionFailure, {
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
        disabled={isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        title={t(translations.deletionConfirmTitle, {
          role: USER_ROLES[user.role],
          name: user.name,
          email: user.email,
        })}
        tooltip={t(translations.deleteTooltip)}
      >
        {userCoursesWithInstanceNames.length > 0 && (
          <>
            <PromptText>
              {t(translations.deletionPromptContent, {
                count: userCoursesWithInstanceNames.length,
              })}
            </PromptText>
            <ol>
              {userCoursesWithInstanceNames.map((course) => (
                <PromptText key={`course-${course.id}`}>
                  <li>
                    {t(translations.associatedCourses, {
                      instanceName: course.instanceName,
                      courseName: course.title,
                    })}
                  </li>
                </PromptText>
              ))}
            </ol>
          </>
        )}
        <PromptText>{t(translations.deletionConfirm)}</PromptText>
      </DeleteButton>
    </div>
  );
};

export default memo(UserManagementButtons, (prevProps, nextProps) => {
  return equal(prevProps.user, nextProps.user);
});
