import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import translations from '../../translations';

const styles = {
  actionButton: {
    marginLeft: 5,
    marginRight: 5,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
    position: 'absolute',
    right: 20,
    width: '100%',
    zIndex: 999,
  },
};

const ZoomActionElements = (props) => {
  const { zoomIn, zoomOut } = props;

  return (
    <div style={styles.wrapper}>
      <Button
        className="btn-submit"
        color="primary"
        onClick={() => zoomIn()}
        style={styles.actionButton}
        variant="contained"
      >
        <FormattedMessage {...translations.zoomIn} />
      </Button>
      <Button
        className="btn-submit"
        color="primary"
        onClick={() => zoomOut()}
        style={styles.actionButton}
        variant="contained"
      >
        <FormattedMessage {...translations.zoomOut} />
      </Button>
    </div>
  );
};

ZoomActionElements.propTypes = {
  zoomIn: PropTypes.func.isRequired,
  zoomOut: PropTypes.func.isRequired,
};

export default ZoomActionElements;
