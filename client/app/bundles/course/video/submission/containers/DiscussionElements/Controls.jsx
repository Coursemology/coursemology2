import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import {
  cyan as activeColor,
  grey as inactiveColor,
} from '@material-ui/core/colors';
import OndemandVideo from '@material-ui/icons/OndemandVideo';
import Refresh from '@material-ui/icons/Refresh';

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
    <>
      <IconButton onClick={props.onRefresh}>
        <Refresh />
      </IconButton>
      <Tooltip title={<FormattedMessage {...translations.toggleLive} />}>
        <IconButton onClick={() => props.onAutoScrollToggle(!props.autoScroll)}>
          <OndemandVideo
            htmlColor={props.autoScroll ? activeColor[500] : inactiveColor[700]}
          />
        </IconButton>
      </Tooltip>
    </>
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
    onAutoScrollToggle: (newState) => dispatch(changeAutoScroll(newState)),
    onRefresh: () => dispatch(refreshDiscussion()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(Controls));
