import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import SkipNext from 'material-ui/svg-icons/av/skip-next';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import styles from '../VideoPlayer.scss';
import translations from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,

  isPostRequest: PropTypes.bool,
  url: PropTypes.string,
};

const defaultProps = {
  isPostRequest: false,
};

function NextVideoButton(props) {
  if (!props.url) {
    return (
      <IconButton
        tooltip={props.intl.formatMessage(translations.noNextVideo)}
        className={styles.nextVideo}
        disabled
      >
        <SkipNext />
      </IconButton>
    );
  }

  return (
    <IconButton
      tooltip={props.intl.formatMessage(translations.watchNextVideo)}
      className={styles.nextVideo}
      href={props.url}
      data-method={props.isPostRequest ? 'post' : ''}
    >
      <SkipNext />
    </IconButton>
  );
}

NextVideoButton.propTypes = propTypes;
NextVideoButton.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    isPostRequest: !state.video.nextVideoSubmissionExists,
    url: state.video.watchNextVideoUrl,
  };
}

export default connect(mapStateToProps)(injectIntl(NextVideoButton));
