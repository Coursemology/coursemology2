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
  '/admin/announcements/new': 'New System Announcement',
  '/admin/users': 'Users',
  '/admin/instances': 'Instances',
  '/admin/courses': 'Courses',
  '/drafts': 'Drafts',
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
    <Paper
      variant="outlined"
      sx={{ margin: '0px 4px 12px 12px', padding: '4px' }}
    >
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
