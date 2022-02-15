import React from 'react';
import { green } from '@material-ui/core/colors';
import { RadioButton } from 'material-ui/RadioButton';

import { answerShape, questionShape } from '../../propTypes';

function MultipleResponse({ question, answer }) {
  const selectedOptions = answer.option_ids;
  return (
    <>
      {question.options.map((option) => (
        <RadioButton
          key={option.id}
          value={option.id}
          checked={selectedOptions.indexOf(option.id) !== -1}
          label={
            <div
              style={
                option.correct && selectedOptions.indexOf(option.id) !== -1
                  ? { backgroundColor: green[50] }
                  : null
              }
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          }
          disabled
        />
      ))}
    </>
  );
}

MultipleResponse.propTypes = {
  question: questionShape,
  answer: answerShape,
};

export default MultipleResponse;
