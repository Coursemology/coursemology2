import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  fontSizeValue: PropTypes.number,
  onChangeFontSize: PropTypes.func,
};

const styles = {
  select: {
    width: '210px',
  },
};

const FontSizeField = (props) => {
  const { intl, fontSizeValue, onChangeFontSize } = props;
  const menuItems = [];

  for (let i = 1; i <= 60; i++) {
    menuItems.push(<MenuItem key={i} value={i} primaryText={i} />);
  }

  return (
    <div>
      <SelectField
        floatingLabelText={intl.formatMessage(translations.fontSize)}
        value={fontSizeValue}
        onChange={onChangeFontSize}
        maxHeight={150}
        style={styles.select}
      >
        {menuItems}
      </SelectField>
    </div>
  );
};

FontSizeField.propTypes = propTypes;
export default injectIntl(FontSizeField);
