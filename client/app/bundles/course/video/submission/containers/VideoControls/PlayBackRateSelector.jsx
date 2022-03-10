import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MenuItem, Select } from '@material-ui/core';
import { videoDefaults } from 'lib/constants/videoConstants';
import styles from '../VideoPlayer.scss';
import { changePlaybackRate } from '../../actions/video';

const propTypes = {
  rate: PropTypes.number.isRequired,
  availableRates: PropTypes.arrayOf(PropTypes.number),
  rateChanged: PropTypes.func.isRequired,
};

const defaultProps = {
  availableRates: videoDefaults.availablePlaybackRates,
};

function PlayBackRateSelector(props) {
  const rateElements = props.availableRates.map((rate) => (
    <MenuItem key={rate} style={{ fontSize: '0.9em' }} value={rate}>
      {`${rate}X`}
    </MenuItem>
  ));

  return (
    <span className={styles.playbackRate}>
      <Select
        onChange={(event) => props.rateChanged(event.target.value)}
        style={{ fontSize: '0.9em' }}
        value={props.rate}
        variant="standard"
      >
        {rateElements}
      </Select>
    </span>
  );
}

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
