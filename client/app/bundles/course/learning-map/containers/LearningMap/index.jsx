import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchNodes } from 'course/learning-map/actions';
import Canvas from '../Canvas';
import Dashboard from '../Dashboard';

const styles = {
  loading: {
    opacity: '0.5',
    pointerEvents: 'none',
  },
};

const LearningMap = (props) => {
  const { dispatch, isLoading } = props;

  useEffect(() => {
    dispatch(fetchNodes());
  }, []);

  return (
    <div style={{ ...(isLoading && styles.loading) }}>
      <Canvas />
      <Dashboard />
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.learningMap.isLoading,
});

LearningMap.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(LearningMap);
