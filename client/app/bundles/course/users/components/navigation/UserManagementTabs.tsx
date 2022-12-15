import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';

import CustomBadge from 'lib/components/extensions/CustomBadge';
import { getCourseURL } from 'lib/helpers/url-builders';
import { getCourseId, getCurrentPath } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
  sharedData: ManageCourseUsersSharedData;
}

const translations = defineMessages({
  studentsTitle: {
    id: 'course.users.UserManagementTabs.studentsTitle',
    defaultMessage: 'Students',
  },
  staffTitle: {
    id: 'course.users.UserManagementTabs.staffTitle',
    defaultMessage: 'Staff',
  },
  enrolRequestsTitle: {
    id: 'course.users.UserManagementTabs.enrolRequestsTitle',
    defaultMessage: 'Enrol Requests',
  },
  inviteTitle: {
    id: 'course.users.UserManagementTabs.inviteTitle',
    defaultMessage: 'Invite Users',
  },
  userInvitationsTitle: {
    id: 'course.users.UserManagementTabs.userInvitationsTitle',
    defaultMessage: 'Invitations',
  },
  personalTimesTitle: {
    id: 'course.users.UserManagementTabs.personalTimesTitle',
    defaultMessage: 'Personalized Timelines',
  },
});

interface TabData {
  label: { id: string; defaultMessage: string };
  href: string;
  count?: number;
}

const courseUrl = getCourseURL(getCourseId());

const allTabs = {
  studentsTab: {
    label: translations.studentsTitle,
    href: `${courseUrl}/students`,
  },
  staffTab: {
    label: translations.staffTitle,
    href: `${courseUrl}/staff`,
  },
  enrolRequestsTab: {
    label: translations.enrolRequestsTitle,
    href: `${courseUrl}/enrol_requests`,
    count: 0,
  },
  inviteTab: {
    label: translations.inviteTitle,
    href: `${courseUrl}/users/invite`,
  },
  userInvitationsTab: {
    label: translations.userInvitationsTitle,
    href: `${courseUrl}/user_invitations`,
    count: 0,
  },
  personalTimesTab: {
    label: translations.personalTimesTitle,
    href: `${courseUrl}/users/personal_times`,
  },
};

const generateTabs = (
  permissions: ManageCourseUsersPermissions,
  sharedData: ManageCourseUsersSharedData,
): TabData[] => {
  const tabs: TabData[] = [];
  if (permissions.canManageCourseUsers) {
    tabs.push(allTabs.studentsTab);
    tabs.push(allTabs.staffTab);
  }
  if (permissions.canManageEnrolRequests) {
    allTabs.enrolRequestsTab.count = sharedData.requestsCount;
    tabs.push(allTabs.enrolRequestsTab);
  }
  tabs.push(allTabs.inviteTab);
  allTabs.userInvitationsTab.count = sharedData.invitationsCount;
  tabs.push(allTabs.userInvitationsTab);
  if (permissions.canManagePersonalTimes) {
    tabs.push(allTabs.personalTimesTab);
  }
  return tabs;
};

// TODO: Once full react migration is complete, we'll refactor this component
// to use react - router - dom's <Link>,
// and control the state of current selected tab, rather than reading from url.
const UserManagementTabs: FC<Props> = (props) => {
  const { permissions, sharedData, intl } = props;

  const tabs = generateTabs(permissions, sharedData);

  const getCurrentTabIndex = (): number => {
    const path = getCurrentPath();
    const res = tabs.findIndex(
      (tab) =>
        tab.href === path ||
        (path?.includes('personal_times') &&
          tab.href?.includes('personal_times')),
    );
    return res === -1 ? 0 : res;
  };

  return (
    <Box className="max-w-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          scrollButtons="auto"
          sx={tabsStyle}
          value={getCurrentTabIndex()}
          variant="scrollable"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label.id}
              component={Link}
              icon={<CustomBadge badgeContent={tab.count} color="error" />}
              iconPosition="end"
              label={intl.formatMessage(tab.label)}
              style={{
                minHeight: 48,
                paddingRight:
                  tab.count === 0 || tab.count === undefined ? 8 : 26,
                textDecoration: 'none',
              }}
              to={tab.href}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default injectIntl(UserManagementTabs);
