import { defineMessages } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AssignmentInd,
  AutoStories,
  Campaign,
  Group,
  ListAlt,
} from '@mui/icons-material';
import { Tab, Tabs } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  announcements: {
    id: 'sysstem.admin.instance.instance.InstanceAdminSidebar.announcements',
    defaultMessage: 'Announcements',
  },
  users: {
    id: 'sysstem.admin.instance.instance.InstanceAdminSidebar.users',
    defaultMessage: 'Users',
  },
  courses: {
    id: 'sysstem.admin.instance.instance.InstanceAdminSidebar.courses',
    defaultMessage: 'Courses',
  },
  components: {
    id: 'sysstem.admin.instance.instance.InstanceAdminSidebar.components',
    defaultMessage: 'Components',
  },
  roleRequests: {
    id: 'sysstem.admin.instance.instance.InstanceAdminSidebar.roleRequests',
    defaultMessage: 'Role Requests',
  },
});

const InstanceAdminTabs = (): JSX.Element => {
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
        value="/admin/instance/announcements"
      />

      <Tab
        className="min-h-0"
        icon={<Group />}
        iconPosition="start"
        label={t(translations.users)}
        value="/admin/instance/users"
      />

      <Tab
        className="min-h-0"
        icon={<AutoStories />}
        iconPosition="start"
        label={t(translations.courses)}
        value="/admin/instance/courses"
      />

      <Tab
        className="min-h-0"
        icon={<ListAlt />}
        iconPosition="start"
        label={t(translations.components)}
        value="/admin/instance/components"
      />

      <Tab
        className="min-h-0"
        icon={<AssignmentInd />}
        iconPosition="start"
        label={t(translations.roleRequests)}
        value="/admin/instance/role_requests"
      />
    </Tabs>
  );
};

export default InstanceAdminTabs;
