import React from 'react';
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
      <RefreshIndicator top={50} left={0} size={60} status="loading" />
    </div>
  </div>
);

export default LoadingIndicator;
