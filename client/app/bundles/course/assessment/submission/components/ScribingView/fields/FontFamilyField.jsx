import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  fontFamilyValue: PropTypes.string,
  onChangeFontFamily: PropTypes.func.isRequired,
};

const styles = {
  select: {
    width: '210px',
  },
};

const FontFamilyField = (props) => {
  const { intl, fontFamilyValue, onChangeFontFamily } = props;
  const fontFamilies = [
    {
      key: intl.formatMessage(translations.arial),
      value: 'Arial',
    },
    {
      key: intl.formatMessage(translations.arialBlack),
      value: 'Arial Black',
    },
    {
      key: intl.formatMessage(translations.comicSansMs),
      value: 'Comic Sans MS',
    },
    {
      key: intl.formatMessage(translations.georgia),
      value: 'Georgia',
    },
    {
      key: intl.formatMessage(translations.impact),
      value: 'Impact',
    },
    {
      key: intl.formatMessage(translations.lucidaSanUnicode),
      value: 'Lucida Sans Unicode',
    },
    {
      key: intl.formatMessage(translations.palatinoLinotype),
      value: 'Palatino Linotype',
    },
    {
      key: intl.formatMessage(translations.tahoma),
      value: 'Tahoma',
    },
    {
      key: intl.formatMessage(translations.timesNewRoman),
      value: 'Times New Roman',
    },
  ];
  const menuItems = [];

  fontFamilies.forEach((font) => {
    menuItems.push(<MenuItem key={font.key} value={font.value} primaryText={font.key} />);
  });

  return (
    <div>
      <SelectField
        floatingLabelText={intl.formatMessage(translations.fontFamily)}
        value={fontFamilyValue}
        onChange={onChangeFontFamily}
        maxHeight={150}
        style={styles.select}
      >
        {menuItems}
      </SelectField>
    </div>
  );
};

FontFamilyField.propTypes = propTypes;
export default injectIntl(FontFamilyField);
