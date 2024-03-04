import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import equal from 'fast-deep-equal';
import { UserMiniEntity } from 'types/users';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import MasqueradeButton from 'lib/components/core/buttons/MasqueradeButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import { USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

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
  deletionConfirmTitle: {
    id: 'system.admin.admin.UsersButton.deletionConfirmTitle',
    defaultMessage: 'Deleting {role} {name} ({email})',
  },
  deletionPromptContent: {
    id: 'system.admin.admin.UsersButton.deletionPromptContent',
    defaultMessage:
      'After deleting this user, all associated instance users in the following instances will be deleted.',
  },
  associatedInstances: {
    id: 'system.admin.admin.UsersButton.associatedInstances',
    defaultMessage: '{index}. {instanceName}',
  },
  deletionConfirm: {
    id: 'system.admin.admin.UsersButton.deletionConfirm',
    defaultMessage: 'Are you sure?',
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
  const { t } = useTranslation();

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
        {user.instances.length > 1 && (
          <>
            <PromptText>{t(translations.deletionPromptContent)}</PromptText>
            {user.instances.map((instance, index) => (
              <PromptText key={`instance-${instance.host}`}>
                {t(translations.associatedInstances, {
                  index: index + 1,
                  instanceName: instance.name,
                })}
              </PromptText>
            ))}
          </>
        )}
        <PromptText>{t(translations.deletionConfirm)}</PromptText>
      </DeleteButton>
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
