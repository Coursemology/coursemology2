import { FC } from 'react';
import { CircularProgress } from '@mui/material';

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
};

const LoadingIndicator: FC = () => (
  <div style={styles.loading}>
    <div style={{ position: 'absolute' }}>
      <CircularProgress size={60} data-testid="CircularProgress" />
    </div>
  </div>
);

export default LoadingIndicator;
