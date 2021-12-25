import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import {
  cyan500 as activeColor,
  grey700 as inactiveColor,
} from 'material-ui/styles/colors';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import OnDemandVideo from 'material-ui/svg-icons/notification/ondemand-video';
import PropTypes from 'prop-types';

import { changeAutoScroll, refreshDiscussion } from '../../actions/discussion';
import translations from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,

  autoScroll: PropTypes.bool,
  onAutoScrollToggle: PropTypes.func,
  onRefresh: PropTypes.func,
};

const defaultProps = {
  autoScroll: false,
};

const Controls = (props) => (
  <>
    <IconButton onClick={props.onRefresh}>
      <Refresh />
    </IconButton>
    <IconButton
      onClick={() => props.onAutoScrollToggle(!props.autoScroll)}
      tooltip={props.intl.formatMessage(translations.toggleLive)}
    >
      <OnDemandVideo color={props.autoScroll ? activeColor : inactiveColor} />
    </IconButton>
  </>
);

Controls.propTypes = propTypes;
Controls.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    autoScroll: state.discussion.scrolling.autoScroll,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onAutoScrollToggle: (newState) => dispatch(changeAutoScroll(newState)),
    onRefresh: () => dispatch(refreshDiscussion()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Controls));
