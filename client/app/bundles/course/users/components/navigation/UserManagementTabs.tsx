import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { getCurrentPath, getCourseId } from 'lib/helpers/url-helpers';
import { getCourseURL } from 'lib/helpers/url-builders';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
  sharedData: ManageCourseUsersSharedData;
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
  tabsIndicatorStyle: {
    // to show tab indicator on firefox
    '& .MuiTabs-indicator': {
      bottom: 'auto',
    },
    minHeight: '50px',
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
          sx={styles.tabsIndicatorStyle}
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
