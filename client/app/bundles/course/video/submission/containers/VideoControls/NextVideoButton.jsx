import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import SkipNext from '@mui/icons-material/SkipNext';
import { IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';

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
          <IconButton disabled>
            <SkipNext />
          </IconButton>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={props.intl.formatMessage(translations.watchNextVideo)}>
      <Link className={styles.nextVideo} to={props.url}>
        <IconButton>
          <SkipNext />
        </IconButton>
      </Link>
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
