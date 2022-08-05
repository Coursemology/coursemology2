import {
  Breadcrumbs as MuiBreadcrumbs,
  Paper,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import Link, { LinkProps } from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const breadcrumbNameMap: { [key: string]: string } = {
  '/admin': 'Administration',
  '/admin/announcements': 'System Announcements',
  '/admin/users': 'Users',
  '/admin/instances': 'Instances',
  '/admin/courses': 'Courses',
  '/admin/instance': 'Instance Administration',
  '/admin/instance/announcements': 'Announcements',
  '/admin/instance/users': 'Users',
  '/admin/instance/users/invite': 'Invite Users',
  '/admin/instance/user_invitations': 'User Invitations',
  '/admin/instance/courses': 'Courses',
  '/admin/instance/components': 'Components',
  '/role_requests': 'Role Requests',
};

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const LinkRouter = (props: LinkRouterProps): JSX.Element => (
  <Link {...props} component={RouterLink} variant="body2" />
);

const Breadcrumbs = (): JSX.Element => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Paper
      variant="outlined"
      sx={{
        marginBottom: '4px',
        padding: '4px 8px',
        backgroundColor: grey[100],
        border: '0',
      }}
    >
      <MuiBreadcrumbs aria-label="breadcrumb">
        {pathnames.map((_value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography color="text.primary" key={to} variant="body2">
              {breadcrumbNameMap[to]}
            </Typography>
          ) : (
            <LinkRouter underline="hover" color="inherit" to={to} key={to}>
              {breadcrumbNameMap[to]}
            </LinkRouter>
          );
        })}
      </MuiBreadcrumbs>
    </Paper>
  );
};
export default Breadcrumbs;
