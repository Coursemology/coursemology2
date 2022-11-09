import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Paper,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import Link, { LinkProps } from '@mui/material/Link';

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
      sx={{
        marginBottom: '4px',
        padding: '4px 8px',
        backgroundColor: grey[100],
        border: '0',
      }}
      variant="outlined"
    >
      <MuiBreadcrumbs aria-label="breadcrumb">
        {pathnames.map((_value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography key={to} color="text.primary" variant="body2">
              {breadcrumbNameMap[to]}
            </Typography>
          ) : (
            <LinkRouter key={to} color="inherit" to={to} underline="hover">
              {breadcrumbNameMap[to]}
            </LinkRouter>
          );
        })}
      </MuiBreadcrumbs>
    </Paper>
  );
};
export default Breadcrumbs;
