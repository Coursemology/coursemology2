import { useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import SkipNext from '@mui/icons-material/SkipNext';
import { IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';

import translations from '../../translations';

import styles from '../VideoPlayer.scss';

const propTypes = {
  intl: PropTypes.object.isRequired,
  url: PropTypes.string,
  nextVideoSubmissionExists: PropTypes.bool,
};

const NextVideoButton = (props) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!props.url) {
    return (
      <Tooltip title={props.intl.formatMessage(translations.noNextVideo)}>
        <div className={styles.nextVideo}>
          <IconButton disabled>
            <SkipNext />
          </IconButton>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={props.intl.formatMessage(translations.watchNextVideo)}>
      <IconButton
        className={styles.nextVideo}
        disabled={isLoading}
        onClick={() => {
          setIsLoading(true);
          if (!props.nextVideoSubmissionExists) {
            CourseAPI.video.submissions.attempt(props.url).then((response) => {
              // TODO: Use `navigate` from `useNavigate` once bundle is ready.
              window.location.href = response.data.submissionUrl;
            });
          } else {
            window.location.href = props.url;
          }
        }}
      >
        <SkipNext />
      </IconButton>
    </Tooltip>
  );
};

NextVideoButton.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    url: state.video.watchNextVideoUrl,
    nextVideoSubmissionExists: state.video.nextVideoSubmissionExists,
  };
}

export default connect(mapStateToProps)(injectIntl(NextVideoButton));
