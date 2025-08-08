import { FC, memo, useState } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { InstanceUserMiniEntity } from 'types/system/instance/users';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteUser } from '../../operations';

interface Props {
  user: InstanceUserMiniEntity;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'system.admin.instance.instance.UsersButton.deletionSuccess',
    defaultMessage: 'User was removed from this instance.',
  },
  deletionFailure: {
    id: 'system.admin.instance.instance.UsersButton.deletionFailure',
    defaultMessage: 'Failed to remove user - {error}',
  },
  deletionConfirmTitle: {
    id: 'system.admin.instance.instance.UsersButton.deletionConfirmTitle',
    defaultMessage: 'Removing {role} User {name} ({email})',
  },
  deletionPromptContent: {
    id: 'system.admin.instance.instance.UsersButton.deletionPromptContent',
    defaultMessage:
      'Removing this user may cause errors in the following {count, plural, one {course} other {courses}}:',
  },
  deletionConfirm: {
    id: 'system.admin.instance.instance.UsersButton.deletionConfirm',
    defaultMessage: 'Are you sure you wish to proceed?',
  },
  deleteTooltip: {
    id: 'system.admin.instance.instance.UsersButton.deleteTooltip',
    defaultMessage: 'Remove User',
  },
});

const UserManagementButtons: FC<Props> = (props) => {
  const { user } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div key={`buttons-${user.id}`}>
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
        {user.courses.length > 0 && (
          <>
            <PromptText>
              {t(translations.deletionPromptContent, {
                count: user.courses.length,
              })}
            </PromptText>
            <ol>
              {user.courses.map((course) => (
                <PromptText key={`course-${course.id}`}>
                  <li>{course.title}</li>
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
