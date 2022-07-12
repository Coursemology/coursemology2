import { Box, Drawer, IconButton, Paper } from '@mui/material';
import { FC, useState } from 'react';
import Menu from '@mui/icons-material/Menu';

interface Props {
  drawer: JSX.Element;
}

const Sidebar: FC<Props> = (props) => {
  const { drawer } = props;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box component="nav" aria-label="sidebar">
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
        {drawer}
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
      <Paper
        variant="outlined"
        style={{ marginRight: '12px' }}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawer}
      </Paper>
    </Box>
  );
};

export default Sidebar;
