import { injectIntl } from 'react-intl';
import {
  CropSquareRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';
import { Button } from '@mui/material';
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
        color={currentShape === scribingShapes.RECT ? 'primary' : 'info'}
        onClick={() => setSelectedShape(scribingShapes.RECT)}
        startIcon={<CropSquareRounded />}
      >
        {intl.formatMessage(translations.rectangle)}
      </Button>

      <Button
        color={currentShape === scribingShapes.ELLIPSE ? 'primary' : 'info'}
        onClick={() => setSelectedShape(scribingShapes.ELLIPSE)}
        startIcon={<RadioButtonUncheckedRounded />}
      >
        {intl.formatMessage(translations.ellipse)}
      </Button>
    </>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
