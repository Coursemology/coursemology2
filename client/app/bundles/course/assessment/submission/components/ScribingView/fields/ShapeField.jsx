import { injectIntl, intlShape } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { blue500 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import { scribingShapes } from '../../../constants';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  currentShape: PropTypes.string.isRequired,
  setSelectedShape: PropTypes.func,
};

const ShapeField = (props) => {
  const { intl, currentShape, setSelectedShape } = props;

  return (
    <>
      <FlatButton
        icon={
          <FontIcon
            className="fa fa-square-o"
            color={
              currentShape === scribingShapes.RECT
                ? blue500
                : 'rgba(0, 0, 0, 0.4)'
            }
          />
        }
        label={intl.formatMessage(translations.rectangle)}
        onClick={() => setSelectedShape(scribingShapes.RECT)}
        primary={currentShape === scribingShapes.RECT}
      />
      <FlatButton
        icon={
          <FontIcon
            className="fa fa-circle-o"
            color={
              currentShape === scribingShapes.ELLIPSE
                ? blue500
                : 'rgba(0, 0, 0, 0.4)'
            }
          />
        }
        label={intl.formatMessage(translations.ellipse)}
        onClick={() => setSelectedShape(scribingShapes.ELLIPSE)}
        primary={currentShape === scribingShapes.ELLIPSE}
      />
    </>
  );
};

ShapeField.propTypes = propTypes;
export default injectIntl(ShapeField);
