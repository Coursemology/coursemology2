import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  AssignmentInd,
  AutoStories,
  Campaign,
  Group,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  ListAlt,
} from '@mui/icons-material';
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { grey } from '@mui/material/colors';

import Sidebar from 'lib/components/navigation/Sidebar';

interface Props extends WrappedComponentProps {
  isExpanded: boolean;
  handleExpand: (forceExpand?: boolean) => void;
}

const translations = defineMessages({
  announcements: {
    id: 'system.admin.instance.components.navigation.sidebar.announcements',
    defaultMessage: 'Announcements',
  },
  users: {
    id: 'system.admin.instance.components.navigation.sidebar.users',
    defaultMessage: 'Users',
  },
  courses: {
    id: 'system.admin.instance.components.navigation.sidebar.courses',
    defaultMessage: 'Courses',
  },
  components: {
    id: 'system.admin.instance.components.navigation.sidebar.components',
    defaultMessage: 'Components',
  },
  roleRequests: {
    id: 'system.admin.instance.components.navigation.sidebar.roleRequests',
    defaultMessage: 'Role Requests',
  },
  collapseSidebar: {
    id: 'system.admin.components.navigation.sidebar.collapse',
    defaultMessage: 'Collapse Sidebar',
  },
  expandSidebar: {
    id: 'system.admin.components.navigation.sidebar.expand',
    defaultMessage: 'Expand Sidebar',
  },
});

interface ListItemLinkProps {
  primary: string;
  to: string;
  icon: JSX.Element;
  expanded: boolean;
  callback: () => void;
}

const ListItemLink = (props: ListItemLinkProps): JSX.Element => {
  const { primary, to, icon, expanded, callback } = props;

  const renderIcon = (): JSX.Element => {
    if (expanded) {
      return <ListItemIcon sx={{ minWidth: '32px' }}>{icon}</ListItemIcon>;
    }
    return (
      <Tooltip placement="right" title={primary}>
        <ListItemIcon sx={{ minWidth: '32px' }}>{icon}</ListItemIcon>
      </Tooltip>
    );
  };

  const textStyle = expanded ? { display: 'block' } : { display: 'none' };

  return (
    <li>
      <ListItem
        button={true}
        component={Link}
        disablePadding={true}
        onClick={callback}
        style={{
          border: 'none',
          outline: 'none',
          textDecoration: 'none',
          padding: '4px 16px',
        }}
        to={to}
      >
        {renderIcon()}
        <ListItemText primary={primary} sx={textStyle} />
      </ListItem>
    </li>
  );
};

const InstanceAdminSidebar: FC<Props> = (props) => {
  const { isExpanded, handleExpand, intl } = props;

  const renderDrawer = (isDrawerOpen, handleDrawerToggle): JSX.Element => {
    const handleExpandClick = (): void => {
      if (isDrawerOpen) {
        handleDrawerToggle();
      } else {
        handleExpand();
      }
    };

    const handleListItemClick = (): void => {
      if (isDrawerOpen) {
        handleDrawerToggle();
      }
    };

    const backgroundColor = isDrawerOpen ? 'white' : grey[100];

    return (
      <Grid
        container={true}
        flexDirection="column"
        justifyContent="space-between"
        style={{ height: '100vh', backgroundColor }}
      >
        <Grid item={true}>
          <List style={{ marginTop: '60px' }}>
            <ListItem button={true} onClick={handleExpandClick}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                {isExpanded ? (
                  <KeyboardDoubleArrowLeft />
                ) : (
                  <Tooltip
                    placement="right"
                    title={intl.formatMessage(translations.expandSidebar)}
                  >
                    <KeyboardDoubleArrowRight />
                  </Tooltip>
                )}
              </ListItemIcon>
              {isExpanded && (
                <ListItemText
                  primary={intl.formatMessage(translations.collapseSidebar)}
                />
              )}
            </ListItem>
            <ListItemLink
              callback={handleListItemClick}
              expanded={isExpanded}
              icon={<Campaign />}
              primary={intl.formatMessage(translations.announcements)}
              to="/admin/instance/announcements"
            />
            <ListItemLink
              callback={handleListItemClick}
              expanded={isExpanded}
              icon={<Group />}
              primary={intl.formatMessage(translations.users)}
              to="/admin/instance/users"
            />
            <ListItemLink
              callback={handleListItemClick}
              expanded={isExpanded}
              icon={<AutoStories />}
              primary={intl.formatMessage(translations.courses)}
              to="/admin/instance/courses"
            />
            <ListItemLink
              callback={handleListItemClick}
              expanded={isExpanded}
              icon={<ListAlt />}
              primary={intl.formatMessage(translations.components)}
              to="/admin/instance/components"
            />
            <ListItemLink
              callback={handleListItemClick}
              expanded={isExpanded}
              icon={<AssignmentInd />}
              primary={intl.formatMessage(translations.roleRequests)}
              to="/role_requests"
            />
          </List>
        </Grid>
      </Grid>
    );
  };

  return (
    <Sidebar
      handleExpand={handleExpand}
      renderDrawer={(isDrawerOpen, handleDrawerToggle): JSX.Element =>
        renderDrawer(isDrawerOpen, handleDrawerToggle)
      }
    />
  );
};

export default injectIntl(InstanceAdminSidebar);
