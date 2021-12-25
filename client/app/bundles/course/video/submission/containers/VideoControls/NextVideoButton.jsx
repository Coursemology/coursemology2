import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import SkipNext from 'material-ui/svg-icons/av/skip-next';
import PropTypes from 'prop-types';

import translations from '../../translations';

import styles from '../VideoPlayer.scss';

const propTypes = {
  intl: intlShape.isRequired,

  isPostRequest: PropTypes.bool,
  url: PropTypes.string,
};

const defaultProps = {
  isPostRequest: false,
};

const NextVideoButton = (props) => {
  if (!props.url) {
    return (
      <IconButton
        className={styles.nextVideo}
        disabled={true}
        tooltip={props.intl.formatMessage(translations.noNextVideo)}
      >
        <SkipNext />
      </IconButton>
    );
  }

  return (
    <IconButton
      className={styles.nextVideo}
      data-method={props.isPostRequest ? 'post' : ''}
      href={props.url}
      tooltip={props.intl.formatMessage(translations.watchNextVideo)}
    >
      <SkipNext />
    </IconButton>
  );
};

NextVideoButton.propTypes = propTypes;
NextVideoButton.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    isPostRequest: !state.video.nextVideoSubmissionExists,
    url: state.video.watchNextVideoUrl,
  };
}

export default connect(mapStateToProps)(injectIntl(NextVideoButton));
