import { defineMessages } from 'react-intl';
import {
  AutoStories,
  AutoStoriesOutlined,
  Campaign,
  CampaignOutlined,
  Category,
  CategoryOutlined,
  Chat,
  ChatOutlined,
  Group,
  GroupOutlined,
  Storefront,
  StorefrontOutlined,
  Timeline,
  TimelineOutlined,
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
  activity: {
    id: 'system.admin.admin.AdminNavigator.activity',
    defaultMessage: 'Activity',
  },
  marketplace: {
    id: 'system.admin.admin.AdminNavigator.marketplace',
    defaultMessage: 'Marketplace Access',
  },
  marketplaceListings: {
    id: 'system.admin.admin.AdminNavigator.marketplaceListings',
    defaultMessage: 'Marketplace Listings',
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
          icon: <CampaignOutlined />,
          activeIcon: <Campaign />,
          title: t(translations.announcements),
          path: '/admin/announcements',
        },
        {
          icon: <GroupOutlined />,
          activeIcon: <Group />,
          title: t(translations.users),
          path: '/admin/users',
        },
        {
          icon: <CategoryOutlined />,
          activeIcon: <Category />,
          title: t(translations.instances),
          path: '/admin/instances',
        },
        {
          icon: <AutoStoriesOutlined />,
          activeIcon: <AutoStories />,
          title: t(translations.courses),
          path: '/admin/courses',
        },
        {
          icon: <TimelineOutlined />,
          activeIcon: <Timeline />,
          title: t(translations.activity),
          path: '/admin/activity',
        },
        {
          icon: <StorefrontOutlined />,
          activeIcon: <Storefront />,
          title: t(translations.marketplace),
          path: '/admin/marketplace_allowlist_rules',
        },
        {
          icon: <StorefrontOutlined />,
          activeIcon: <Storefront />,
          title: t(translations.marketplaceListings),
          path: '/admin/marketplace_listings',
        },
        {
          icon: <ChatOutlined />,
          activeIcon: <Chat />,
          title: t(translations.getHelp),
          path: '/admin/get_help',
        },
      ]}
    />
  );
};

const handle = translations.systemAdminPanel;

export default Object.assign(AdminNavigator, { handle });
