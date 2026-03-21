import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import palette from 'theme/palette';

import LoadingIndicator from './LoadingIndicator';

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: alpha(palette.background.paper, 0.7),
  },
  progressContainer: {
    margin: 'auto',
  },
};

const LoaderOverlay = (): JSX.Element => {
  return (
    <Box className="z-overlay" sx={styles.overlay}>
      <Box style={styles.progressContainer}>
        <LoadingIndicator />
      </Box>
    </Box>
  );
};

export default LoaderOverlay;
