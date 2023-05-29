import { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchNodes } from 'course/learning-map/operations';
import translations from 'course/learning-map/translations';

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
  }, [dispatch]);

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

const handle = translations.defaultDashboardMessage;

export default Object.assign(connect(mapStateToProps)(LearningMap), { handle });
