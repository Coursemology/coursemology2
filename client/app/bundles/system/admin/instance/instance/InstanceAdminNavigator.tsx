import { defineMessages } from 'react-intl';
import {
  AssignmentInd,
  AutoStories,
  Campaign,
  Group,
  ListAlt,
} from '@mui/icons-material';

import AdminNavigablePage from 'bundles/system/admin/components/AdminNavigablePage';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchInstance } from './operations';

const translations = defineMessages({
  announcements: {
    id: 'sysstem.admin.instance.instance.InstanceAdminNavigator.announcements',
    defaultMessage: 'Announcements',
  },
  users: {
    id: 'sysstem.admin.instance.instance.InstanceAdminNavigator.users',
    defaultMessage: 'Users',
  },
  courses: {
    id: 'sysstem.admin.instance.instance.InstanceAdminNavigator.courses',
    defaultMessage: 'Courses',
  },
  components: {
    id: 'sysstem.admin.instance.instance.InstanceAdminNavigator.components',
    defaultMessage: 'Components',
  },
  roleRequests: {
    id: 'sysstem.admin.instance.instance.InstanceAdminNavigator.roleRequests',
    defaultMessage: 'Role Requests',
  },
});

const InstanceAdminNavigator = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <AdminNavigablePage
      paths={[
        {
          icon: <Campaign />,
          title: t(translations.announcements),
          path: '/admin/instance/announcements',
        },
        {
          icon: <Group />,
          title: t(translations.users),
          path: '/admin/instance/users',
        },
        {
          icon: <AutoStories />,
          title: t(translations.courses),
          path: '/admin/instance/courses',
        },
        {
          icon: <ListAlt />,
          title: t(translations.components),
          path: '/admin/instance/components',
        },
        {
          icon: <AssignmentInd />,
          title: t(translations.roleRequests),
          path: '/admin/instance/role_requests',
        },
      ]}
    />
  );
};

const handle: DataHandle = () => ({
  getData: async (): Promise<string> => {
    const data = await fetchInstance();
    return `${data.name} Admin Panel`;
  },
});

export default Object.assign(InstanceAdminNavigator, { handle });
