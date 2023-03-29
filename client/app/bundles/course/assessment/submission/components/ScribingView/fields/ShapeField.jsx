import { injectIntl } from 'react-intl';
import {
  CropSquareRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
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
        <IconButton
          style={
            currentShape === scribingShapes.RECT
              ? { color: blue[500] }
              : { color: 'rgba(0, 0, 0, 0.4)' }
          }
        >
          <CropSquareRounded />
        </IconButton>
        {intl.formatMessage(translations.rectangle)}
      </Button>

      <Button
        className="forum-post-expand-button"
        color={currentShape === scribingShapes.ELLIPSE ? 'primary' : 'info'}
        onClick={() => setSelectedShape(scribingShapes.ELLIPSE)}
      >
        <IconButton
          style={
            currentShape === scribingShapes.ELLIPSE
              ? { color: blue[500] }
              : { color: 'rgba(0, 0, 0, 0.4)' }
          }
        >
          <RadioButtonUncheckedRounded />
        </IconButton>
        {intl.formatMessage(translations.ellipse)}
      </Button>
    </>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
