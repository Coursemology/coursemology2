import { connect } from 'react-redux';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
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
    <MenuItem key={rate} primaryText={`${rate}X`} value={rate} />
  ));

  return (
    <span className={styles.playbackRate}>
      <DropDownMenu
        labelStyle={{ fontSize: '0.9em' }}
        menuItemStyle={{ fontSize: '0.9em' }}
        onChange={(_e, _index, value) => props.rateChanged(value)}
        value={props.rate}
      >
        {rateElements}
      </DropDownMenu>
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
