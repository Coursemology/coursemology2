import ChipInput from 'material-ui-chip-input';
import PropTypes from 'prop-types';

import createComponent from './createComponent';

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  text: PropTypes.string,
});

const propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  value: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.arrayOf(optionShape),
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

const styles = {
  menuStyle: {
    maxHeight: '80vh',
    overflowY: 'auto',
  },
};

const MultiSelect = (props) => {
  const { label, value, options, error, isLoading, onChange } = props;

  const seletedOptions = value.map((v) => options.find((o) => o.id === v));

  return (
    <ChipInput
      dataSource={options}
      dataSourceConfig={{ value: 'id', text: 'title' }}
      disabled={isLoading}
      errorText={error}
      floatingLabelFixed={true}
      floatingLabelText={label}
      fullWidth={true}
      menuStyle={styles.menuStyle}
      onBeforeRequestAdd={(chip) => {
        // don't allow adding of arbitrary values by typing
        if (typeof chip === 'string' || chip instanceof String) {
          return false;
        }
        return true;
      }}
      onRequestAdd={(addedChip) => {
        onChange([...value, addedChip.id]);
      }}
      onRequestDelete={(deletedChipId) => {
        const values = value.filter((v) => v !== deletedChipId);
        onChange(values);
      }}
      openOnFocus={true}
      value={seletedOptions}
    />
  );
};

MultiSelect.propTypes = propTypes;

const mapProps = ({ input, ...props }) => ({
  value: input.value,
  onChange: input.onChange,
  ...props,
});

export default createComponent(MultiSelect, mapProps);
