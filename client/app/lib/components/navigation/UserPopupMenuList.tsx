import { ComponentProps } from 'react';
import { defineMessages } from 'react-intl';

import GlobalAPI from 'api';
import PopupMenu from 'lib/components/core/PopupMenu';
import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  accountSettings: {
    id: 'course.courses.CourseUserItem.accountSettings',
    defaultMessage: 'Account settings',
  },
  signOut: {
    id: 'course.courses.CourseUserItem.signOut',
    defaultMessage: 'Sign out',
  },
});

const UserPopupMenuList = (
  props: Pick<ComponentProps<typeof PopupMenu.List>, 'header'>,
): JSX.Element => {
  const { t } = useTranslation();

  const { signOutUrl } = useAppContext();

  const signOut = async (): Promise<void> => {
    if (!signOutUrl) return;

    await GlobalAPI.users.signOut(signOutUrl);

    // TODO: Reset Redux store and navigate via React Router once SPA.
    window.location.href = '/';
  };

  return (
    <PopupMenu.List header={props.header}>
      <PopupMenu.Button to="/user/profile/edit">
        {t(translations.accountSettings)}
      </PopupMenu.Button>

      <PopupMenu.Button onClick={signOut} textProps={{ color: 'error' }}>
        {t(translations.signOut)}
      </PopupMenu.Button>
    </PopupMenu.List>
  );
};

export default UserPopupMenuList;
