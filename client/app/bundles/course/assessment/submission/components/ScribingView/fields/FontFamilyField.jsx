import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { MenuItem } from '@mui/material';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  fontFamilyValue: PropTypes.string,
  onChangeFontFamily: PropTypes.func.isRequired,
};

const styles = {
  select: {
    width: '210px',
    maxHeight: 150,
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
    menuItems.push(
      <MenuItem key={font.key} value={font.value}>
        {font.key}
      </MenuItem>,
    );
  });

  return (
    <div>
      <FormControl variant="standard">
        <InputLabel>{intl.formatMessage(translations.fontFamily)}</InputLabel>
        <Select
          value={fontFamilyValue}
          onChange={onChangeFontFamily}
          style={styles.select}
          variant="standard"
        >
          {menuItems}
        </Select>
      </FormControl>
    </div>
  );
};

FontFamilyField.propTypes = propTypes;
export default injectIntl(FontFamilyField);
