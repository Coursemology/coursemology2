import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import './layout.scss';

interface AppLayoutProps {
  routes: JSX.Element;
  renderSidebar: (
    isExpanded: boolean,
    setIsExpanded: (forceExpand?: boolean) => void,
  ) => JSX.Element;
}

const AppLayout = (props: AppLayoutProps): JSX.Element => {
  const { routes, renderSidebar } = props;
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExpand = (forceExpand): void => {
    if (forceExpand) {
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Grid container>
      <Grid
        item
        className="sidebar"
        sx={{ transition: 'max-width 0.3s ease-in-out' }}
        xs={1}
        sm={isExpanded ? 4 : 2}
        md={isExpanded ? 3 : 1}
        lg={isExpanded ? 2 : 1}
      >
        {renderSidebar(isExpanded, handleExpand)}
      </Grid>
      <Grid
        item
        className="breadcrumbs"
        xs={11}
        sm={isExpanded ? 8 : 10}
        md={isExpanded ? 9 : 11}
        lg={isExpanded ? 10 : 11}
        sx={{ marginBottom: '4px' }}
      >
        <Breadcrumbs />
      </Grid>
      <Grid
        item
        xs={0}
        sm={isExpanded ? 4 : 2}
        md={isExpanded ? 3 : 1}
        lg={isExpanded ? 2 : 1}
      />
      <Grid
        item
        className="content"
        sx={{ transition: 'max-width 0.2s ease-in-out' }}
        xs={12}
        sm={isExpanded ? 8 : 10}
        md={isExpanded ? 9 : 11}
        lg={isExpanded ? 10 : 11}
      >
        {routes}
      </Grid>
    </Grid>
  );
};

export default AppLayout;
