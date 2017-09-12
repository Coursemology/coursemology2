import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Chip from 'material-ui/Chip';
import { cyan500, grey50 } from 'material-ui/styles/colors';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  lineToolType: PropTypes.string,
  selectedLineStyle: PropTypes.string,
  onTouchTapLineStyleChip: PropTypes.func,
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
  chip: {
    margin: '4px',
  },
  chipWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '220px',
    padding: '40px 0px',
  },
};

class LineStyleField extends Component {
  renderLineStyleChips() {
    const {
      intl, lineToolType, selectedLineStyle,
      onTouchTapLineStyleChip,
    } = this.props;
    const lineStyles = [
      {
        key: intl.formatMessage(translations.solid),
        value: 'solid',
      },
      {
        key: intl.formatMessage(translations.dotted),
        value: 'dotted',
      },
      {
        key: intl.formatMessage(translations.dashed),
        value: 'dashed',
      },
    ];
    const chips = [];
    lineStyles.forEach(style => (chips.push(
      <Chip
        backgroundColor={selectedLineStyle === style.value ? cyan500 : undefined}
        labelColor={selectedLineStyle === style.value ? grey50 : undefined}
        key={lineToolType + style.value}
        style={styles.chip}
        onTouchTap={event => onTouchTapLineStyleChip(event, lineToolType, style.value)}
      >
        {style.key}
      </Chip>
    )));
    return chips;
  }

  render() {
    const { intl } = this.props;

    return (
      <div style={styles.fieldDiv}>
        <label htmlFor="line-style" style={styles.label}>{intl.formatMessage(translations.style)}</label>
        <div style={styles.chipWrapper}>
          { this.renderLineStyleChips() }
        </div>
      </div>
    );
  }
}

LineStyleField.propTypes = propTypes;
export default injectIntl(LineStyleField);
