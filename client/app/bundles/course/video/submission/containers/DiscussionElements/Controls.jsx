import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { injectIntl } from 'react-intl';
import {
  cyan as activeColor,
  grey as inactiveColor,
} from '@mui/material/colors';
import OndemandVideo from '@mui/icons-material/OndemandVideo';
import Refresh from '@mui/icons-material/Refresh';

import { changeAutoScroll, refreshDiscussion } from '../../actions/discussion';
import translations from '../../translations';

const propTypes = {
  intl: PropTypes.object.isRequired,

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
      <Tooltip title={props.intl.formatMessage(translations.toggleLive)}>
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
