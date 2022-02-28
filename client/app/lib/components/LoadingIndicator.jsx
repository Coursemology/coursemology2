import { CircularProgress } from '@material-ui/core';

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  loadingInnerDiv: {
    position: 'relative',
  },
};

const LoadingIndicator = () => (
  <div style={styles.loading}>
    <div style={styles.loadingInnerDiv}>
      <CircularProgress size={60} />
    </div>
  </div>
);

export default LoadingIndicator;
