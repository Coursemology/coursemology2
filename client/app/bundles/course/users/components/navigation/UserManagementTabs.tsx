import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/courseUsers';
import { getCurrentPath, getCourseId } from 'lib/helpers/url-helpers';
import { getCourseURL } from 'lib/helpers/url-builders';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
  tabData: ManageCourseUsersTabData;
}

interface LinkTabProps {
  key: string;
  label: string | JSX.Element;
  href: string | undefined;
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

const styles = {
  tabStyle: {
    '&:focus': {
      outline: 0,
    },
  },
};

interface TabData {
  label: { id: string; defaultMessage: string };
  href?: string;
  count?: number;
}

const courseUrl = getCourseURL(getCourseId());

const LinkTab = (props: LinkTabProps): JSX.Element => {
  return <Tab component="a" {...props} sx={styles.tabStyle} />;
};

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
  tabData: ManageCourseUsersTabData,
): TabData[] => {
  const tabs: TabData[] = [];
  if (permissions.canManageCourseUsers) {
    tabs.push(allTabs.studentsTab);
    tabs.push(allTabs.staffTab);
  }
  if (permissions.canManageEnrolRequests) {
    allTabs.enrolRequestsTab.count = tabData.requestsCount;
    tabs.push(allTabs.enrolRequestsTab);
  }
  tabs.push(allTabs.inviteTab);
  allTabs.userInvitationsTab.count = tabData.invitationsCount;
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
  const { permissions, tabData, intl } = props;

  const tabs = generateTabs(permissions, tabData);

  const getCurrentTabIndex = (): number => {
    const path = getCurrentPath();
    return tabs.findIndex((tab) => tab.href === path);
  };

  const getTabLabel = (tab: TabData): string | JSX.Element => {
    if (tab.count) {
      return (
        <Badge
          badgeContent={tab.count}
          color="error"
          sx={{ '& .MuiBadge-badge': { right: '-2px' } }}
        >
          {intl.formatMessage(tab.label)}
        </Badge>
      );
    }
    return intl.formatMessage(tab.label);
  };

  const managementTabs = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={getCurrentTabIndex()}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <LinkTab
              key={tab.label.id}
              label={getTabLabel(tab)}
              href={tab.href}
            />
          ))}
        </Tabs>
      </Box>
    </>
  );

  return managementTabs;
};

export default injectIntl(UserManagementTabs);
