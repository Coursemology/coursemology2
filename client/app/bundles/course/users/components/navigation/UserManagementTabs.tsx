import { FC } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { CourseUsersPermissions } from 'types/course/course_users';
import { getCurrentPath } from 'lib/helpers/url-helpers';

interface Props {
  permissions: CourseUsersPermissions;
  intl?: any;
}

const translations = defineMessages({
  studentsTitle: {
    id: 'course.users.students.tab.title',
    defaultMessage: 'Students',
  },
  staffTitle: {
    id: 'course.users.staff.tab.title',
    defaultMessage: 'Staff',
  },
  enrolRequestsTitle: {
    id: 'course.enrolRequests.tab.title',
    defaultMessage: 'Enrol Requests',
  },
  inviteTitle: {
    id: 'course.invite.tab.title',
    defaultMessage: 'Invite Users',
  },
  userInvitationsTitle: {
    id: 'course.userInvitations.tab.title',
    defaultMessage: 'Invitations',
  },
  personalTimesTitle: {
    id: 'course.users.personalTimes.tab.title',
    defaultMessage: 'Personalized Timelines',
  },
});

interface Tab {
  label?: string;
  href?: string;
}

const LinkTab: FC<Tab> = (props: Tab) => {
  return <Tab component="a" {...props} />;
};

const allTabs = {
  studentsTab: {
    label: translations.studentsTitle,
    href: 'students',
  },
  staffTab: {
    label: translations.staffTitle,
    href: 'staff',
  },
  enrolRequestsTab: {
    label: translations.enrolRequestsTitle,
    href: 'enrol_requests',
  },
  inviteTab: {
    label: translations.inviteTitle,
    href: 'users/invite',
  },
  userInvitationsTab: {
    label: translations.userInvitationsTitle,
    href: 'user_invitations',
  },
  personalTimesTab: {
    label: translations.personalTimesTitle,
    href: 'users/personal_times',
  },
};

const generateTabs = (permissions: CourseUsersPermissions) => {
  const tabs: Tab[] = [];
  if (permissions.canManageCourseUsers) {
    tabs.push(allTabs.studentsTab);
    tabs.push(allTabs.staffTab);
  }
  if (permissions.canManageEnrolRequests) {
    tabs.push(allTabs.enrolRequestsTab);
  }
  tabs.push(allTabs.inviteTab);
  tabs.push(allTabs.userInvitationsTab);
  if (permissions.canManagePersonalTimes) {
    tabs.push(allTabs.personalTimesTab);
  }
  return tabs;
};

const UserManagementTabs: FC<Props> = (props) => {
  const { permissions, intl } = props;

  const tabs = generateTabs(permissions);

  const getCurrentTab = () => {
    const path = getCurrentPath();
    return tabs.findIndex((tab) => tab.href === path);
  };

  const managementTabs = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={getCurrentTab()} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab, index) => (
            <LinkTab
              key={index}
              label={intl.formatMessage(tab.label)}
              href={tab.href}
            />
          ))}
          {/* <LinkTab
            label={intl.formatMessage(translations.studentsTitle)}
            href="students"
          />
          <LinkTab
            label={intl.formatMessage(translations.staffTitle)}
            href="staff"
          />
          <LinkTab
            label={intl.formatMessage(translations.enrolRequestsTitle)}
            href="enrol_requests"
          />
          <LinkTab
            label={intl.formatMessage(translations.inviteTitle)}
            href="users/invite"
          />
          <LinkTab
            label={intl.formatMessage(translations.userInvitationsTitle)}
            href="user_invitations"
          />
          {permissions.canManagePersonalTimes ? (
            <LinkTab
              label={intl.formatMessage(translations.personalTimesTitle)}
              href="users/personal_times"
            />
          ) : null} */}
        </Tabs>
      </Box>
    </>
  );

  return managementTabs;
};

export default injectIntl(UserManagementTabs);
