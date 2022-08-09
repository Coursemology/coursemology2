import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';
import Sidebar from 'lib/components/navigation/Sidebar';
import {
  AssignmentInd,
  AutoStories,
  Campaign,
  Group,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  ListAlt,
} from '@mui/icons-material';
import { grey } from '@mui/material/colors';

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
        button
        disablePadding
        component={Link}
        to={to}
        style={{
          border: 'none',
          outline: 'none',
          textDecoration: 'none',
          padding: '4px 16px',
        }}
        onClick={callback}
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
        container
        justifyContent="space-between"
        style={{ height: '100vh', backgroundColor }}
        flexDirection="column"
      >
        <Grid item>
          <List style={{ marginTop: '60px' }}>
            <ListItemLink
              to="/admin/instance/announcements"
              primary={intl.formatMessage(translations.announcements)}
              callback={handleListItemClick}
              icon={<Campaign />}
              expanded={isExpanded}
            />
            <ListItemLink
              to="/admin/instance/users"
              primary={intl.formatMessage(translations.users)}
              callback={handleListItemClick}
              icon={<Group />}
              expanded={isExpanded}
            />
            <ListItemLink
              to="/admin/instance/courses"
              primary={intl.formatMessage(translations.courses)}
              callback={handleListItemClick}
              icon={<AutoStories />}
              expanded={isExpanded}
            />
            <ListItemLink
              to="/admin/instance/components"
              primary={intl.formatMessage(translations.components)}
              callback={handleListItemClick}
              icon={<ListAlt />}
              expanded={isExpanded}
            />
            <ListItemLink
              to="/role_requests"
              primary={intl.formatMessage(translations.roleRequests)}
              callback={handleListItemClick}
              icon={<AssignmentInd />}
              expanded={isExpanded}
            />
          </List>
        </Grid>
        <Grid item>
          <List>
            <ListItem button onClick={handleExpandClick}>
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
          </List>
        </Grid>
      </Grid>
    );
  };

  return (
    <Sidebar
      renderDrawer={(isDrawerOpen, handleDrawerToggle): JSX.Element =>
        renderDrawer(isDrawerOpen, handleDrawerToggle)
      }
      handleExpand={handleExpand}
    />
  );
};

export default injectIntl(InstanceAdminSidebar);
