import { useState } from 'react';
import Grid from '@mui/material/Grid';

import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';

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
    <Grid container={true}>
      <Grid
        className="sidebar"
        item={true}
        lg={isExpanded ? 2 : 1}
        md={isExpanded ? 3 : 1}
        sm={isExpanded ? 4 : 2}
        xs={1}
      >
        {renderSidebar(isExpanded, handleExpand)}
      </Grid>
      <Grid
        className="breadcrumbs"
        item={true}
        lg={isExpanded ? 10 : 11}
        md={isExpanded ? 9 : 11}
        sm={isExpanded ? 8 : 10}
        sx={{ marginBottom: '4px' }}
        xs={11}
      >
        <Breadcrumbs />
      </Grid>
      <Grid
        item={true}
        lg={isExpanded ? 2 : 1}
        md={isExpanded ? 3 : 1}
        sm={isExpanded ? 4 : 2}
        xs={0}
      />
      <Grid
        className="content"
        item={true}
        lg={isExpanded ? 10 : 11}
        md={isExpanded ? 9 : 11}
        sm={isExpanded ? 8 : 10}
        xs={12}
      >
        {routes}
      </Grid>
    </Grid>
  );
};

export default AppLayout;
