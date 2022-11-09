import { injectIntl } from 'react-intl';
import { Slider } from '@mui/material';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: PropTypes.object.isRequired,
  toolThicknessValue: PropTypes.number,
  onChangeSliderThickness: PropTypes.func,
};

const styles = {
  fieldDiv: {
    fontSize: '16px',
    lineHeight: '24px',
    width: '210px',
    height: '72px',
    display: 'block',
    position: 'relative',
    backgroundColor: 'transparent',
    fontFamily: 'Roboto, sans-serif',
    transition: 'height 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    cursor: 'auto',
  },
  label: {
    position: 'absolute',
    lineHeight: '22px',
    top: '38px',
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    zIndex: '1',
    transform: 'scale(0.75) translate(0px, -28px)',
    transformOrigin: 'left top 0px',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  slider: {
    padding: '60px 0px',
  },
};

const LineThicknessField = (props) => {
  const { intl, toolThicknessValue, onChangeSliderThickness } = props;

  return (
    <div style={styles.fieldDiv}>
      <label htmlFor="line-thickness" style={styles.label}>
        {intl.formatMessage(translations.thickness)}
      </label>
      <Slider
        max={5}
        min={0}
        onChange={onChangeSliderThickness}
        size="small"
        step={1}
        style={styles.slider}
        value={toolThicknessValue}
      />
    </div>
  );
};

LineThicknessField.propTypes = propTypes;
export default injectIntl(LineThicknessField);
