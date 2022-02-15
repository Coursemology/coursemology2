import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@material-ui/core';
import SkipNext from '@material-ui/icons/SkipNext';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

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
      <Tooltip title={<FormattedMessage {...translations.noNextVideo} />}>
        <IconButton className={styles.nextVideo} disabled>
          <SkipNext />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={<FormattedMessage {...translations.watchNextVideo} />}>
      <IconButton
        className={styles.nextVideo}
        href={props.url}
        data-method={props.isPostRequest ? 'post' : ''}
      >
        <SkipNext nativeColor="black" />
      </IconButton>
    </Tooltip>
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
