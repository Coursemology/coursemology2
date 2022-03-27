import React from 'react';
import classStyles from './ConnectionPoint.scss';

const styles = {
  connectionPoint: {
    alignItems: 'center',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '50%',
    display: 'flex',
    height: '10px',
    justifyContent: 'center',
    position: 'relative',
    width: '10px',
  },
};

const ConnectionPoint = (props) => {
  const {
    id,
    isActive,
    onClick,
    zIndex,
  } = props;

  return (
    <div
      className={isActive ? classStyles.selectableConnectionPoint : undefined}
      onClick={isActive ? onClick : undefined}
      style={{...styles.connectionPoint, zIndex: zIndex}}
    >
      {/* For centering arrow starting point inside the circle */}
      <div id={id}></div>
    </div>
  );
};

export default ConnectionPoint;
