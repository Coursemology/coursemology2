import { defineMessages } from 'react-intl';

import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

import PopupMenu from '../core/PopupMenu';
import { useAuthAdapter } from '../wrappers/AuthProvider';

const translations = defineMessages({
  accountSettings: {
    id: 'lib.component.navigation.UserPopupMenuList.accountSettings',
    defaultMessage: 'Account settings',
  },
  accountSettingsSubtitle: {
    id: 'lib.component.navigation.UserPopupMenuList.accountSettingsSubtitle',
    defaultMessage: 'Language, emails, and password',
  },
  signOut: {
    id: 'lib.component.navigation.UserPopupMenuList.signOut',
    defaultMessage: 'Sign out',
  },
  goToYourSiteWideProfile: {
    id: 'lib.component.navigation.UserPopupMenuList.goToYourSiteWideProfile',
    defaultMessage: 'Go to your site-wide profile',
  },
});

const UserPopupMenuList = (): JSX.Element | null => {
  const { user } = useAppContext();
  const auth = useAuthAdapter();
  const { t } = useTranslation();

  if (!user) return null;

  const handleLogout = async (): Promise<void> => {
    await auth.removeUser();
    await auth.signoutRedirect();
    localStorage.clear();
  };

  return (
    <PopupMenu.List>
      <PopupMenu.Button linkProps={{ to: `/users/${user.id}` }}>
        {t(translations.goToYourSiteWideProfile)}
      </PopupMenu.Button>

      <PopupMenu.Button
        linkProps={{ to: '/user/profile/edit' }}
        secondary={t(translations.accountSettingsSubtitle)}
      >
        {t(translations.accountSettings)}
      </PopupMenu.Button>

      <PopupMenu.Button onClick={handleLogout} textProps={{ color: 'error' }}>
        {t(translations.signOut)}
      </PopupMenu.Button>
    </PopupMenu.List>
  );
};

export default UserPopupMenuList;
