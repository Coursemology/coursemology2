import { connect } from 'react-redux';
import { MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';

import { videoDefaults } from 'lib/constants/videoConstants';

import { changePlaybackRate } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  rate: PropTypes.number.isRequired,
  availableRates: PropTypes.arrayOf(PropTypes.number),
  rateChanged: PropTypes.func.isRequired,
};

const defaultProps = {
  availableRates: videoDefaults.availablePlaybackRates,
};

const PlayBackRateSelector = (props) => {
  const rateElements = props.availableRates.map((rate) => (
    <MenuItem key={rate} className="text-xl" value={rate}>
      {`${rate}X`}
    </MenuItem>
  ));

  return (
    <span className={styles.playbackRate}>
      <Select
        className="text-xl"
        onChange={(event) => props.rateChanged(event.target.value)}
        value={props.rate}
        variant="standard"
      >
        {rateElements}
      </Select>
    </span>
  );
};

PlayBackRateSelector.propTypes = propTypes;
PlayBackRateSelector.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    rate: state.video.playbackRate,
    availableRates: ownProps.availableRates,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rateChanged: (newRate) => dispatch(changePlaybackRate(newRate)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlayBackRateSelector);
