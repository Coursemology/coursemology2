import { FC, useState } from 'react';
import Menu from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton } from '@mui/material';

import styles from 'lib/components/core/layouts/layout.scss';

interface Props {
  renderDrawer: (
    isDrawerOpen: boolean,
    handleDrawerToggle: () => void,
  ) => JSX.Element;
  handleExpand: (forceExpand?: boolean) => void;
}

const Sidebar: FC<Props> = (props) => {
  const { renderDrawer, handleExpand } = props;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = (): void => {
    if (!isDrawerOpen) {
      handleExpand(true); // force expansion of sidebar elements
    }
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box aria-label="sidebar" component="nav" sx={{ width: '100%' }}>
      {/* Mobile */}
      <Drawer
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        onClose={handleDrawerToggle}
        open={isDrawerOpen}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '80%' },
        }}
        variant="temporary"
      >
        {renderDrawer(isDrawerOpen, handleDrawerToggle)}
      </Drawer>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          padding: '2px 8px',
        }}
      >
        <Menu />
      </IconButton>

      {/* Desktop */}
      <Drawer
        className={`${styles.sidebarContainer}`}
        style={{ marginRight: '12px' }}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
        transitionDuration={1000}
        variant="permanent"
      >
        {renderDrawer(isDrawerOpen, handleDrawerToggle)}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
