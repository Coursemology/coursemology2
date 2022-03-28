import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  actionButton: {
    marginLeft: 5,
    marginRight: 5,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
    position: 'absolute',
    right: 20,
    width: '100%',
    zIndex: 9999,
  },
};

const ZoomActionElements = (props) => {
  const {
    zoomIn,
    zoomOut,
  } = props;

  return (
    <div style={styles.wrapper}>
      <RaisedButton
        label={'Zoom In'}
        primary
        className='btn-submit'
        onClick={() => zoomIn()}
        style={styles.actionButton}
      />
      <RaisedButton
        label={'Zoom Out'}
        primary
        className='btn-submit'
        onClick={() => zoomOut()}
        style={styles.actionButton}
      />
    </div>
  );
};

export default ZoomActionElements;
