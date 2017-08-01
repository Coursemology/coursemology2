import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import ChipInput from 'lib/components/ChipInput';
import { questionNamePrefix, questionIdPrefix } from '../constants';
import { skillShape } from '../propTypes';

const propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(skillShape),
  options: PropTypes.arrayOf(skillShape),
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

const styles = {
  menuStyle: {
    maxHeight: '80vh',
    overflowY: 'scroll',
  },
  skillChip: {
    display: 'none',
  },
};

const MultiSelectSkillsField = (props) => {
  const { label, field, value, options, error, isLoading } = props;
  return (
    <div>
      <Field
        name={questionNamePrefix + field}
        id={questionIdPrefix + field}
        component={cpProps => (
          <ChipInput
            id={questionIdPrefix + field}
            value={cpProps.input.value || []}
            dataSource={options}
            dataSourceConfig={{ value: 'id', text: 'title' }}
            onRequestAdd={(addedChip) => {
              cpProps.input.onChange([...cpProps.input.value, addedChip]);
            }}
            onRequestDelete={(deletedChip) => {
              const values = (cpProps.input.value || []).filter(v => v.id !== deletedChip);
              cpProps.input.onChange(values);
            }}
            floatingLabelText={label}
            floatingLabelFixed
            openOnFocus
            fullWidth
            disabled={isLoading}
            errorText={error}
            menuStyle={styles.menuStyle}
          />
        )}
      />

      <select
        name={`${questionNamePrefix + field}[]`}
        multiple
        value={value.map(opt => opt.id)}
        style={styles.skillChip}
        disabled={isLoading}
        onChange={_ => _}
      >
        { options.map(opt => <option value={opt.id} key={opt.id}>{opt.title}</option>) }
      </select>
    </div>
  );
};

MultiSelectSkillsField.propTypes = propTypes;

export default MultiSelectSkillsField;
