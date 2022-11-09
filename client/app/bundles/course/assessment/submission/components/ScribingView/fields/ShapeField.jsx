import { injectIntl } from 'react-intl';
import { Button, Icon } from '@mui/material';
import { blue } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { scribingShapes } from '../../../constants';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: PropTypes.object.isRequired,
  currentShape: PropTypes.string.isRequired,
  setSelectedShape: PropTypes.func,
};

const ShapeField = (props) => {
  const { intl, currentShape, setSelectedShape } = props;

  return (
    <>
      <Button
        className="forum-post-expand-button"
        color={currentShape === scribingShapes.RECT ? 'primary' : 'info'}
        onClick={() => setSelectedShape(scribingShapes.RECT)}
      >
        <Icon
          className="fa fa-square-o"
          style={
            currentShape === scribingShapes.RECT
              ? { color: blue[500] }
              : { color: 'rgba(0, 0, 0, 0.4)' }
          }
        />
        {intl.formatMessage(translations.rectangle)}
      </Button>

      <Button
        className="forum-post-expand-button"
        color={currentShape === scribingShapes.ELLIPSE ? 'primary' : 'info'}
        onClick={() => setSelectedShape(scribingShapes.ELLIPSE)}
      >
        <Icon
          className="fa fa-circle-o"
          style={
            currentShape === scribingShapes.ELLIPSE
              ? { color: blue[500] }
              : { color: 'rgba(0, 0, 0, 0.4)' }
          }
        />
        {intl.formatMessage(translations.ellipse)}
      </Button>
    </>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
