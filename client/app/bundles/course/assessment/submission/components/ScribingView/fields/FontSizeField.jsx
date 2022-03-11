import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { MenuItem } from '@mui/material';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  fontSizeValue: PropTypes.number,
  onChangeFontSize: PropTypes.func,
};

const styles = {
  select: {
    width: '210px',
    maxHeight: 150,
  },
};

const FontSizeField = (props) => {
  const { intl, fontSizeValue, onChangeFontSize } = props;
  const menuItems = [];

  for (let i = 1; i <= 60; i++) {
    menuItems.push(
      <MenuItem key={i} value={i}>
        {i}
      </MenuItem>,
    );
  }

  return (
    <div>
      <FormControl variant="standard">
        <InputLabel>{intl.formatMessage(translations.fontSize)}</InputLabel>
        <Select
          value={fontSizeValue}
          onChange={onChangeFontSize}
          style={styles.select}
          variant="standard"
        >
          {menuItems}
        </Select>
      </FormControl>
    </div>
  );
};

FontSizeField.propTypes = propTypes;
export default injectIntl(FontSizeField);
