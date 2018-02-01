import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import OnDemandVideo from 'material-ui/svg-icons/notification/ondemand-video';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import { intlShape, injectIntl } from 'react-intl';
import { cyan500 as activeColor, grey700 as inactiveColor } from 'material-ui/styles/colors';

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

function Controls(props) {
  return (
    <div>
      <IconButton onClick={props.onRefresh}>
        <Refresh />
      </IconButton>
      <IconButton
        tooltip={props.intl.formatMessage(translations.toggleLive)}
        onClick={() => props.onAutoScrollToggle(!props.autoScroll)}
      >
        <OnDemandVideo color={props.autoScroll ? activeColor : inactiveColor} />
      </IconButton>
    </div>
  );
}

Controls.propTypes = propTypes;
Controls.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    autoScroll: state.discussion.scrolling.autoScroll,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onAutoScrollToggle: newState => dispatch(changeAutoScroll(newState)),
    onRefresh: () => dispatch(refreshDiscussion()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Controls));
