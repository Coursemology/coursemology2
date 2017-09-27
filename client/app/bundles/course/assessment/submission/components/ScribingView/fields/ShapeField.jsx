import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { blue500 } from 'material-ui/styles/colors';

import { scribingTranslations as translations } from '../../../translations';
import { scribingShapes } from '../../../constants';

const propTypes = {
  intl: intlShape.isRequired,
  currentShape: PropTypes.string.isRequired,
  setSelectedShape: PropTypes.func,
};

const ShapeField = (props) => {
  const { intl, currentShape, setSelectedShape } = props;

  return (
    <div>
      <IconButton
        tooltip={intl.formatMessage(translations.rectangle)}
        tooltipPosition="top-center"
        onClick={() => (setSelectedShape(scribingShapes.RECT))}
      >
        <FontIcon
          color={currentShape === scribingShapes.RECT ?
            blue500 : 'rgba(0, 0, 0, 0.4)'}
          className="fa fa-square-o"
        />
      </IconButton>
      <IconButton
        tooltip={intl.formatMessage(translations.ellipse)}
        tooltipPosition="top-center"
        onClick={() => (setSelectedShape(scribingShapes.ELLIPSE))}
      >
        <FontIcon
          color={currentShape === scribingShapes.ELLIPSE ?
            blue500 : 'rgba(0, 0, 0, 0.4)'}
          className="fa fa-circle-o"
        />
      </IconButton>
    </div>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
