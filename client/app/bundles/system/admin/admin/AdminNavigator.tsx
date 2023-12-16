import { defineMessages } from 'react-intl';
import {
  AutoStories,
  Campaign,
  Category,
  Group,
  Key,
} from '@mui/icons-material';

import useTranslation from 'lib/hooks/useTranslation';

import AdminNavigablePage from '../components/AdminNavigablePage';

const translations = defineMessages({
  announcements: {
    id: 'system.admin.admin.AdminNavigator.announcements',
    defaultMessage: 'System Announcements',
  },
  users: {
    id: 'system.admin.admin.AdminNavigator.users',
    defaultMessage: 'Users',
  },
  instances: {
    id: 'system.admin.admin.AdminNavigator.instances',
    defaultMessage: 'Instances',
  },
  courses: {
    id: 'system.admin.admin.AdminNavigator.courses',
    defaultMessage: 'Courses',
  },
  authentications: {
    id: 'system.admin.admin.AdminNavigator.authentications',
    defaultMessage: 'Authentications',
  },
  systemAdminPanel: {
    id: 'system.admin.admin.AdminNavigator.systemAdminPanel',
    defaultMessage: 'System Admin Panel',
  },
});

const AdminNavigator = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <AdminNavigablePage
      paths={[
        {
          icon: <Campaign />,
          title: t(translations.announcements),
          path: '/admin/announcements',
        },
        {
          icon: <Group />,
          title: t(translations.users),
          path: '/admin/users',
        },
        {
          icon: <Category />,
          title: t(translations.instances),
          path: '/admin/instances',
        },
        {
          icon: <AutoStories />,
          title: t(translations.courses),
          path: '/admin/courses',
        },
        {
          icon: <Key />,
          title: t(translations.authentications),
          path: '/admin/authentications',
        },
      ]}
    />
  );
};

const handle = translations.systemAdminPanel;

export default Object.assign(AdminNavigator, { handle });
