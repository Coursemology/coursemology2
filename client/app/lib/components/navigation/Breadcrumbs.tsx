import {
  Breadcrumbs as MuiBreadcrumbs,
  Paper,
  Typography,
} from '@mui/material';
import Link, { LinkProps } from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const breadcrumbNameMap: { [key: string]: string } = {
  '/admin': 'Administration',
  '/admin/announcements': 'System Announcements',
  '/admin/users': 'Users',
  '/admin/instances': 'Instances',
  '/admin/courses': 'Courses',
};

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const LinkRouter = (props: LinkRouterProps): JSX.Element => (
  <Link {...props} component={RouterLink} />
);

const Breadcrumbs = (): JSX.Element => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Paper variant="outlined" sx={{ marginBottom: '4px', padding: '4px 8px' }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        {pathnames.map((_value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography color="text.primary" key={to}>
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
