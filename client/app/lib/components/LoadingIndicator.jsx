import RefreshIndicator from 'material-ui/RefreshIndicator';

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
      <RefreshIndicator left={0} size={60} status="loading" top={50} />
    </div>
  </div>
);

export default LoadingIndicator;
