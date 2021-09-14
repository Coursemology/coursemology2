import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { green50 } from 'material-ui/styles/colors';
import { RadioButton } from 'material-ui/RadioButton';

import { questionShape } from '../../propTypes';

function MultipleChoiceOptions({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  input: { onChange, value },
}) {
  return (
    <>
      {question.options.map((option) => (
        <RadioButton
          key={option.id}
          value={option.id}
          onCheck={(event, buttonValue) => onChange(buttonValue)}
          checked={option.id === value}
          label={
            <div
              style={
                option.correct && readOnly && (showMcqMrqSolution || graderView)
                  ? { backgroundColor: green50 }
                  : null
              }
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          }
          disabled={readOnly}
        />
      ))}
    </>
  );
}

MultipleChoiceOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.number,
  }).isRequired,
};

function MultipleChoice({
  question,
  readOnly,
  showMcqMrqSolution,
  graderView,
  answerId,
}) {
  return (
    <Field
      name={`${answerId}[option_ids][0]`}
      component={MultipleChoiceOptions}
      {...{ question, readOnly, showMcqMrqSolution, graderView }}
    />
  );
}

MultipleChoice.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleChoice;
