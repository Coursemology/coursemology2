import { Box, Drawer, IconButton } from '@mui/material';
import { FC, useState } from 'react';
import Menu from '@mui/icons-material/Menu';
import styles from '../layouts/layout.scss';

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
    <Box component="nav" aria-label="sidebar" sx={{ width: '100%' }}>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '80%' },
        }}
      >
        {renderDrawer(isDrawerOpen, handleDrawerToggle)}
      </Drawer>
      <IconButton
        sx={{
          display: { xs: 'block', sm: 'none' },
          padding: '2px 8px',
        }}
        onClick={handleDrawerToggle}
      >
        <Menu />
      </IconButton>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        style={{ marginRight: '12px' }}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
        className={`${styles.sidebarContainer}`}
        transitionDuration={1000}
      >
        {renderDrawer(isDrawerOpen, handleDrawerToggle)}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
