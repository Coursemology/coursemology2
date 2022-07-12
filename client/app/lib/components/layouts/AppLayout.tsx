import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';
import Grid from '@mui/material/Grid';

interface AppLayoutProps {
  routes: JSX.Element;
  sidebar: JSX.Element;
}

const AppLayout = (props: AppLayoutProps): JSX.Element => {
  const { routes, sidebar } = props;

  return (
    <div>
      <Grid container>
        <Grid
          item
          className="breadcrumbs"
          xs={11}
          sm={12}
          sx={{ marginBottom: '4px' }}
        >
          <Breadcrumbs />
        </Grid>
        <Grid item className="sidebar" xs={1} sm={4} md={3} lg={2}>
          {sidebar}
        </Grid>
        <Grid item className="content" xs={12} sm={8} md={9} lg={10}>
          {routes}
        </Grid>
      </Grid>
    </div>
  );
};

export default AppLayout;
