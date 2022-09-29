import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import SkipNext from '@mui/icons-material/SkipNext';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import styles from '../VideoPlayer.scss';
import translations from '../../translations';

const propTypes = {
  intl: PropTypes.object.isRequired,

  url: PropTypes.string,
};

function NextVideoButton(props) {
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
      <IconButton className={styles.nextVideo} href={props.url}>
        <SkipNext htmlColor="black" />
      </IconButton>
    </Tooltip>
  );
}

NextVideoButton.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    url: state.video.watchNextVideoUrl,
  };
}

export default connect(mapStateToProps)(injectIntl(NextVideoButton));
