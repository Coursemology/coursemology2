import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
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
