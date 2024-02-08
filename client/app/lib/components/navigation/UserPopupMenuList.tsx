import { defineMessages } from 'react-intl';
import { useAuth } from 'react-oidc-context';

import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

import PopupMenu from '../core/PopupMenu';

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
  const auth = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const handleLogout = async (): Promise<void> => {
    await auth.removeUser();
    auth.signoutRedirect();
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
