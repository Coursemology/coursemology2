import { defineMessages } from 'react-intl';
import {
  AutoStories,
  Campaign,
  Category,
  Chat,
  Group,
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
  getHelp: {
    id: 'system.admin.admin.AdminNavigator.getHelp',
    defaultMessage: 'Get Help',
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
          icon: <Chat />,
          title: t(translations.getHelp),
          path: '/admin/get_help',
        },
      ]}
    />
  );
};

const handle = translations.systemAdminPanel;

export default Object.assign(AdminNavigator, { handle });
