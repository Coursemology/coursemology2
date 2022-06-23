import { List, ListItem, ListItemText, Paper } from '@mui/material';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';

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
}

const ListItemLink = (props: ListItemLinkProps): JSX.Element => {
  const { primary, to } = props;

  //   const renderLink = () => {
  //     return <Link to={to} />;
  //   };

  return (
    <li>
      <ListItem
        button
        component={Link}
        to={to}
        style={{ border: 'none', outline: 'none', textDecoration: 'none' }}
      >
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
};

const Sidebar: FC<Props> = (props) => {
  const { intl } = props;

  return (
    <nav aria-label="sidebar">
      <Paper variant="outlined" style={{ margin: '0px 12px' }}>
        <List>
          <ListItemLink
            to="/admin/announcements"
            primary={intl.formatMessage(translations.announcements)}
          />
          <ListItemLink
            to="/admin/users"
            primary={intl.formatMessage(translations.users)}
          />
          <ListItemLink
            to="/admin/instances"
            primary={intl.formatMessage(translations.instances)}
          />
          <ListItemLink
            to="/admin/courses"
            primary={intl.formatMessage(translations.courses)}
          />
        </List>
      </Paper>
    </nav>
  );
};

export default injectIntl(Sidebar);
