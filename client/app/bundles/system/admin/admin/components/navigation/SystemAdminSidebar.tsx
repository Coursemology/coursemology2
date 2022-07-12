import { List, ListItem, ListItemText } from '@mui/material';
import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';
import Sidebar from 'lib/components/navigation/Sidebar';

type Props = WrappedComponentProps;

const translations = defineMessages({
  announcements: {
    id: 'system.admin.components.navigation.sidebar.announcements',
    defaultMessage: 'System Announcements',
  },
  users: {
    id: 'system.admin.components.navigation.sidebar.users',
    defaultMessage: 'Users',
  },
  instances: {
    id: 'system.admin.components.navigation.sidebar.instances',
    defaultMessage: 'Instances',
  },
  courses: {
    id: 'system.admin.components.navigation.sidebar.courses',
    defaultMessage: 'Courses',
  },
});

interface ListItemLinkProps {
  primary: string;
  to: string;
  callback: () => void;
}

const ListItemLink = (props: ListItemLinkProps): JSX.Element => {
  const { primary, to, callback } = props;

  return (
    <li>
      <ListItem
        button
        component={Link}
        to={to}
        style={{ border: 'none', outline: 'none', textDecoration: 'none' }}
        onClick={callback}
      >
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
};

const SystemAdminSidebar: FC<Props> = (props) => {
  const { intl } = props;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawer = (
    <List>
      <ListItemLink
        to="/admin/announcements"
        primary={intl.formatMessage(translations.announcements)}
        callback={handleDrawerToggle}
      />
      <ListItemLink
        to="/admin/users"
        primary={intl.formatMessage(translations.users)}
        callback={handleDrawerToggle}
      />
      <ListItemLink
        to="/admin/instances"
        primary={intl.formatMessage(translations.instances)}
        callback={handleDrawerToggle}
      />
      <ListItemLink
        to="/admin/courses"
        primary={intl.formatMessage(translations.courses)}
        callback={handleDrawerToggle}
      />
    </List>
  );

  return <Sidebar drawer={drawer} />;
};

export default injectIntl(SystemAdminSidebar);
