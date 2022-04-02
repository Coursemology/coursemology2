import React from 'react';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import translations from '../../translations.intl'

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
    zIndex: 999,
  },
};

const ZoomActionElements = (props) => {
  const {
    zoomIn,
    zoomOut,
  } = props;

  return (
    <div style={styles.wrapper}>
      <Button
        label={'Zoom In'}
        color='primary'
        className='btn-submit'
        onClick={() => zoomIn()}
        style={styles.actionButton}
        variant='contained'
      >
        <FormattedMessage {...translations.zoomIn} />
      </Button>
      <Button
        label={'Zoom Out'}
        color='primary'
        className='btn-submit'
        onClick={() => zoomOut()}
        style={styles.actionButton}
        variant='contained'
      >
        <FormattedMessage {...translations.zoomOut} />
      </Button>
    </div>
  );
};

export default ZoomActionElements;
