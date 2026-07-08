import { FC, memo, useState } from 'react';
import {
  AddModeratorOutlined,
  RemoveModeratorOutlined,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';
import formTranslations from 'lib/translations/form';

import { deleteUser, suspendUsers, unsuspendUsers } from '../../operations';
import translations from '../../translations';

interface Props {
  user: CourseUserMiniEntity;
  disabled?: boolean;
}

const UserManagementButtons: FC<Props> = (props) => {
  const { user } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const userTranslationDict = {
    role: t(roleTranslations[user.role]),
    name: user.name,
    email: user.email,
  };

  const onDelete = (): Promise<void> => {
    setIsExecutingAction(true);
    return dispatch(deleteUser(user.id))
      .then(() => {
        toast.success(t(translations.deletionScheduled, userTranslationDict));
      })
      .catch((error) => {
        toast.error(t(translations.deletionFailure, userTranslationDict));
        throw error;
      })
      .finally(() => setIsExecutingAction(false));
  };

  const onSuspend = (): void => {
    setIsExecutingAction(true);
    dispatch(suspendUsers([user.id]))
      .then(() => {
        toast.success(t(translations.suspendSuccess, { name: user.name }));
      })
      .catch(() => {
        toast.error(t(translations.suspendFailure, { name: user.name }));
      })
      .finally(() => {
        setIsExecutingAction(false);
      });
  };

  const onUnsuspend = (): void => {
    setIsExecutingAction(true);
    dispatch(unsuspendUsers([user.id]))
      .then(() => {
        toast.success(t(translations.unsuspendSuccess, { name: user.name }));
      })
      .catch(() => {
        toast.error(t(translations.unsuspendFailure, { name: user.name }));
      })
      .finally(() => {
        setIsExecutingAction(false);
      });
  };

  return (
    <div key={`buttons-${user.id}`} className="flex items-center space-x-2">
      <Tooltip
        title={
          user.isSuspended ? t(translations.unsuspend) : t(translations.suspend)
        }
      >
        <IconButton
          className={`user-suspend-${user.id}`}
          disabled={isExecutingAction || Boolean(props.disabled)}
          onClick={user.isSuspended ? onUnsuspend : onSuspend}
        >
          {user.isSuspended ? (
            <AddModeratorOutlined />
          ) : (
            <RemoveModeratorOutlined />
          )}
        </IconButton>
      </Tooltip>
      <DeleteButton
        className={`user-delete-${user.id}`}
        confirmMessage={t(translations.deletionConfirm, {
          role: t(roleTranslations[user.role]),
          name: user.name,
          email: user.email,
        })}
        disabled={isExecutingAction || Boolean(props.disabled)}
        loading={isExecutingAction}
        onClick={onDelete}
        tooltip={t(formTranslations.delete)}
      />
    </div>
  );
};

export default memo(UserManagementButtons, equal);
