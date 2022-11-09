import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import SkipNext from '@mui/icons-material/SkipNext';
import { IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

import translations from '../../translations';

import styles from '../VideoPlayer.scss';

const propTypes = {
  intl: PropTypes.object.isRequired,
  url: PropTypes.string,
};

const NextVideoButton = (props) => {
  if (!props.url) {
    return (
      <Tooltip title={props.intl.formatMessage(translations.noNextVideo)}>
        <div className={styles.nextVideo}>
          <IconButton disabled={true}>
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
};

NextVideoButton.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    url: state.video.watchNextVideoUrl,
  };
}

export default connect(mapStateToProps)(injectIntl(NextVideoButton));
