import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import {
  AssignmentInd,
  AutoStories,
  Campaign,
  Chat,
  Group,
  ListAlt,
} from '@mui/icons-material';

import AdminNavigablePage from 'bundles/system/admin/components/AdminNavigablePage';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchInstance, indexComponents } from './operations';
import { actions } from './store';

const translations = defineMessages({
  announcements: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.announcements',
    defaultMessage: 'Announcements',
  },
  users: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.users',
    defaultMessage: 'Users',
  },
  courses: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.courses',
    defaultMessage: 'Courses',
  },
  components: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.components',
    defaultMessage: 'Components',
  },
  roleRequests: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.roleRequests',
    defaultMessage: 'Role Requests',
  },
  getHelp: {
    id: 'system.admin.instance.instance.InstanceAdminNavigator.getHelp',
    defaultMessage: 'Get Help',
  },
});

const InstanceAdminNavigator = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.instanceAdmin.components);

  useEffect(() => {
    // Load components if not already loaded
    if (components.length === 0) {
      indexComponents()
        .then((componentData) => {
          dispatch(actions.initComponentList(componentData));
        })
        .catch((error) => {
          console.error('Failed to load components:', error);
        });
    }
  }, [components.length]);

  // Check if codaveri component is enabled
  const isCodaveriEnabled = components.some(
    (component) =>
      component.key === 'course_codaveri_component' && component.enabled,
  );

  const basePaths = [
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
  ];

  // Only add Get Help tab if codaveri component is enabled
  const paths = isCodaveriEnabled
    ? [
        ...basePaths,
        {
          icon: <Chat />,
          title: t(translations.getHelp),
          path: '/admin/instance/get_help',
        },
      ]
    : basePaths;

  return <AdminNavigablePage paths={paths} />;
};

const handle: DataHandle = () => ({
  getData: async (): Promise<string> => {
    const data = await fetchInstance();
    return `${data.name} Instance Admin Panel`;
  },
});

export default Object.assign(InstanceAdminNavigator, { handle });
