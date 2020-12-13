import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { green50 } from 'material-ui/styles/colors';
import Checkbox from 'material-ui/Checkbox';

import { questionShape } from '../../propTypes';

function MultipleResponseOptions({ readOnly, question, input }) {
  return (
    <>
      {question.options.map(option => (
        <Checkbox
          disabled={readOnly}
          key={option.id}
          value={option.id}
          checked={input.value.indexOf(option.id) !== -1}
          onCheck={(event, isInputChecked) => {
            const newValue = [...input.value];
            if (isInputChecked) {
              newValue.push(option.id);
            } else {
              newValue.splice(newValue.indexOf(option.id), 1);
            }
            return input.onChange(newValue);
          }}
          label={(
            <div
              style={option.correct && readOnly ? { backgroundColor: green50 } : null}
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          )}
          labelStyle={{ verticalAlign: 'middle' }}
        />
      ))}
    </>
  );
}

MultipleResponseOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

MultipleResponseOptions.defaultProps = {
  readOnly: false,
};

function MultipleResponse({ question, readOnly, answerId }) {
  return (
    <Field
      name={`${answerId}[option_ids]`}
      component={MultipleResponseOptions}
      {...{ question, readOnly }}
    />
  );
}

MultipleResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleResponse;
