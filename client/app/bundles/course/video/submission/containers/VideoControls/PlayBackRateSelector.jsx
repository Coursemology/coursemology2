import React from 'react';
import PropTypes from 'prop-types';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import styles from '../VideoPlayer.scss';
import { videoDefaults } from '../../constants';

const propTypes = {
  rate: PropTypes.number.isRequired,
  availableRates: PropTypes.arrayOf(PropTypes.number),
  rateChanged: PropTypes.func.isRequired,
};

const defaultProps = {
  availableRates: videoDefaults.availablePlaybackRates,
};

function PlayBackRateSelector(props) {
  const rateElements = props.availableRates.map(rate => (
    <MenuItem key={rate} value={rate} primaryText={`${rate}X`} />
  ));

  return (
    <span className={styles.playbackRate}>
      <DropDownMenu
        value={props.rate}
        onChange={(_e, _index, value) => props.rateChanged(value)}
        labelStyle={{ fontSize: '0.9em' }}
        menuItemStyle={{ fontSize: '0.9em' }}
      >
        {rateElements}
      </DropDownMenu>
    </span>
  );
}

PlayBackRateSelector.propTypes = propTypes;
PlayBackRateSelector.defaultProps = defaultProps;

export default PlayBackRateSelector;
