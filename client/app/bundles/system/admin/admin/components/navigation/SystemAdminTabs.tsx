import { defineMessages } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { AutoStories, Campaign, Category, Group } from '@mui/icons-material';
import { Tab, Tabs } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  announcements: {
    id: 'system.admin.admin.SystemAdminSidebar.announcements',
    defaultMessage: 'System Announcements',
  },
  users: {
    id: 'system.admin.admin.SystemAdminSidebar.users',
    defaultMessage: 'Users',
  },
  instances: {
    id: 'system.admin.admin.SystemAdminSidebar.instances',
    defaultMessage: 'Instances',
  },
  courses: {
    id: 'system.admin.admin.SystemAdminSidebar.courses',
    defaultMessage: 'Courses',
  },
});

const SystemAdminTabs = (): JSX.Element => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Tabs
      className="sticky top-0 z-50 bg-white border-only-b-neutral-200"
      onChange={(_, value): void => navigate(value)}
      value={location.pathname}
    >
      <Tab
        className="min-h-0"
        icon={<Campaign />}
        iconPosition="start"
        label={t(translations.announcements)}
        value="/admin/announcements"
      />

      <Tab
        className="min-h-0"
        icon={<Group />}
        iconPosition="start"
        label={t(translations.users)}
        value="/admin/users"
      />

      <Tab
        className="min-h-0"
        icon={<Category />}
        iconPosition="start"
        label={t(translations.instances)}
        value="/admin/instances"
      />

      <Tab
        className="min-h-0"
        icon={<AutoStories />}
        iconPosition="start"
        label={t(translations.courses)}
        value="/admin/courses"
      />
    </Tabs>
  );
};

export default SystemAdminTabs;
