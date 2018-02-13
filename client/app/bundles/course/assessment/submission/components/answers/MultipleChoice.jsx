import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { green50 } from 'material-ui/styles/colors';
import { RadioButton } from 'material-ui/RadioButton';

import { questionShape } from '../../propTypes';

function MultipleChoiceOptions({ readOnly, question, input: { onChange, value } }) {
  return (
    <React.Fragment>
      {question.options.map(option => (
        <RadioButton
          key={option.id}
          value={option.id}
          onCheck={(event, buttonValue) => onChange(buttonValue)}
          checked={option.id === value}
          label={(
            <div
              style={option.correct && readOnly ? { backgroundColor: green50 } : null}
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          )}
          disabled={readOnly}
        />
      ))}
    </React.Fragment>
  );
}

MultipleChoiceOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  input: PropTypes.shape({
    onChange: PropTypes.func,
  }).isRequired,
};

function MultipleChoice({ question, readOnly, answerId }) {
  return (
    <Field
      name={`${answerId}[option_ids][0]`}
      component={MultipleChoiceOptions}
      {...{ question, readOnly }}
    />
  );
}

MultipleChoice.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleChoice;
