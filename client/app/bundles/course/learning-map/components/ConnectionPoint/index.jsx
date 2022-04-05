import PropTypes from 'prop-types';
import classStyles from './ConnectionPoint.scss';

const styles = {
  connectionPoint: {
    alignItems: 'center',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '50%',
    display: 'flex',
    height: 10,
    justifyContent: 'center',
    position: 'relative',
    width: 10,
  },
};

const ConnectionPoint = (props) => {
  const { id, isActive, onClick } = props;

  return (
    <div
      className={isActive ? classStyles.selectableConnectionPoint : undefined}
      onClick={isActive ? onClick : undefined}
      style={styles.connectionPoint}
    >
      {/* For centering arrow starting point inside the circle */}
      <div id={id} />
    </div>
  );
};

ConnectionPoint.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

export default ConnectionPoint;
