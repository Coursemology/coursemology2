import React from 'react';
import { Icon } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import translations from '../../translations.intl';
import PropTypes from 'prop-types';

const styles = {
  content: {
    fontSize: 10,
    margin: 'auto',
    position: 'absolute',
  },
  filledPortion: {
    backgroundColor: 'rgba(109, 242, 145)',
    height: '100%',
  },
  icon: {
    fontSize: '12px',
    margin: 'auto',
    padding: '0px',
  },
  unfilledPortion: {
    backgroundColor: 'white',
    height: '100%',
  },
  unlockRateBar: {
    alignItems: 'center',
    border: '1px solid black',
    display: 'flex',
    flexDirection: 'row',
    height: 12,
    margin: 'auto',
  },
};

const UnlockRateDisplay = (props) => {
  const {
    unlockRate,
    width,
  } = props;

  return (
    <div>
      <Icon
        className={'fa fa-unlock'}
        style={styles.icon}
      />
      <div style={{...styles.unlockRateBar, width: width}}>
        <div style={{...styles.filledPortion, width: unlockRate * width}}></div>
        <div style={{...styles.unfilledPortion, width: width - (unlockRate * width)}}></div>
        <div style={{...styles.content, width: width}}>
          <FormattedMessage
            {...translations.unlockRate}
            values={{ unlockRate: (unlockRate * 100).toFixed(2) }}
          />
        </div>
      </div>
    </div>
  );
};

UnlockRateDisplay.propTypes = {
  unlockRate: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default UnlockRateDisplay;
