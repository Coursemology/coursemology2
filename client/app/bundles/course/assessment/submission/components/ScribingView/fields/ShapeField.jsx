import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import { Button } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

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
    <>
      <Button
        color={currentShape === scribingShapes.RECT && 'primary'}
        className="forum-post-expand-button"
        onClick={() => setSelectedShape(scribingShapes.RECT)}
      >
        <FontIcon
          color={
            currentShape === scribingShapes.RECT
              ? blue[500]
              : 'rgba(0, 0, 0, 0.4)'
          }
          className="fa fa-square-o"
        />
        {intl.formatMessage(translations.rectangle)}
      </Button>

      <Button
        color={currentShape === scribingShapes.ELLIPSE && 'primary'}
        className="forum-post-expand-button"
        onClick={() => setSelectedShape(scribingShapes.ELLIPSE)}
      >
        <FontIcon
          color={
            currentShape === scribingShapes.ELLIPSE
              ? blue[500]
              : 'rgba(0, 0, 0, 0.4)'
          }
          className="fa fa-circle-o"
        />
        {intl.formatMessage(translations.ellipse)}
      </Button>
    </>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
