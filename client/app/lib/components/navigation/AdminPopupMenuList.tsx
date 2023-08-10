import { defineMessages } from 'react-intl';

import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

import PopupMenu from '../core/PopupMenu';

const translations = defineMessages({
  jobsDashboard: {
    id: 'lib.components.navigation.AdminPopupMenuList.jobsDashboard',
    defaultMessage: 'Jobs Dashboard',
  },
  siteWideAnnouncements: {
    id: 'lib.components.navigation.AdminPopupMenuList.siteWideAnnouncements',
    defaultMessage: 'Site-wide Announcements',
  },
  adminPanel: {
    id: 'lib.components.navigation.AdminPopupMenuList.adminPanel',
    defaultMessage: 'System Admin Panel',
  },
  instanceAdminPanel: {
    id: 'lib.components.navigation.AdminPopupMenuList.instanceAdminPanel',
    defaultMessage: 'Instance Admin Panel',
  },
});

const AdminPopupMenuList = (): JSX.Element | null => {
  const { t } = useTranslation();

  const { user } = useAppContext();

  const isSuperAdmin = user?.role === 'administrator';
  const isInstanceAdmin = user?.instanceRole === 'administrator';

  if (!(isSuperAdmin || isInstanceAdmin)) return null;

  return (
    <>
      {isSuperAdmin && (
        <>
          <PopupMenu.List>
            <PopupMenu.Button linkProps={{ to: '/admin' }}>
              {t(translations.adminPanel)}
            </PopupMenu.Button>

            <PopupMenu.Button
              linkProps={{ opensInNewTab: true, to: '/sidekiq' }}
            >
              {t(translations.jobsDashboard)}
            </PopupMenu.Button>

            <PopupMenu.Button linkProps={{ to: '/announcements' }}>
              {t(translations.siteWideAnnouncements)}
            </PopupMenu.Button>
          </PopupMenu.List>

          <PopupMenu.Divider />
        </>
      )}

      {(isSuperAdmin || isInstanceAdmin) && (
        <PopupMenu.List>
          <PopupMenu.Button linkProps={{ to: '/admin/instance' }}>
            {t(translations.instanceAdminPanel)}
          </PopupMenu.Button>
        </PopupMenu.List>
      )}

      <PopupMenu.Divider />
    </>
  );
};

export default AdminPopupMenuList;
