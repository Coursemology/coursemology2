import React from 'react';
import PropTypes from 'prop-types';
import ChipInput from 'material-ui-chip-input';
import createComponent from './createComponent';

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  text: PropTypes.string,
});

const propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  value: PropTypes.arrayOf(optionShape),
  options: PropTypes.arrayOf(optionShape),
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

const styles = {
  menuStyle: {
    maxHeight: '80vh',
    overflowY: 'scroll',
  },
};

const MultiSelect = (props) => {
  const { label, value, options, error, isLoading, onChange } = props;

  return (
    <React.Fragment>
      <ChipInput
        value={value || []}
        dataSource={options}
        dataSourceConfig={{ value: 'id', text: 'title' }}
        onRequestAdd={(addedChip) => {
          onChange([...value, addedChip]);
        }}
        onRequestDelete={(deletedChip) => {
          const values = (value || []).filter(v => v.id !== deletedChip);
          onChange(values);
        }}
        floatingLabelText={label}
        floatingLabelFixed
        openOnFocus
        fullWidth
        disabled={isLoading}
        errorText={error}
        menuStyle={styles.menuStyle}
      />
    </React.Fragment>
  );
};

MultiSelect.propTypes = propTypes;

const mapProps = ({ input, ...props }) => ({
  value: input.value,
  onChange: input.onChange,
  ...props,
});

export default createComponent(MultiSelect, mapProps);
