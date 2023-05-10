import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';

import './layout.scss';

interface AppLayoutProps {
  renderSidebar: (
    isExpanded: boolean,
    setIsExpanded: (forceExpand?: boolean) => void,
  ) => JSX.Element;
}

const AppLayout = (props: AppLayoutProps): JSX.Element => {
  const { renderSidebar } = props;
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
        className="sidebar"
        item
        lg={isExpanded ? 2 : 1}
        md={isExpanded ? 3 : 1}
        sm={isExpanded ? 4 : 2}
        xs={1}
      >
        {renderSidebar(isExpanded, handleExpand)}
      </Grid>
      <Grid
        className="breadcrumbs"
        item
        lg={isExpanded ? 10 : 11}
        md={isExpanded ? 9 : 11}
        sm={isExpanded ? 8 : 10}
        sx={{ marginBottom: '4px' }}
        xs={11}
      >
        <Breadcrumbs />
      </Grid>
      <Grid
        item
        lg={isExpanded ? 2 : 1}
        md={isExpanded ? 3 : 1}
        sm={isExpanded ? 4 : 2}
        xs={0}
      />
      <Grid
        className="content"
        item
        lg={isExpanded ? 10 : 11}
        md={isExpanded ? 9 : 11}
        sm={isExpanded ? 8 : 10}
        xs={12}
      >
        <Outlet />
      </Grid>
    </Grid>
  );
};

export default AppLayout;
