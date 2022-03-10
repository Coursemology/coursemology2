import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormControlLabel } from '@material-ui/core';
import { Checkbox } from '@mui/material';
import { green } from '@mui/material/colors';
import { questionShape } from '../../propTypes';

function MultipleResponseOptions({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  input,
}) {
  return (
    <>
      {question.options.map((option) => (
        <FormControlLabel
          checked={input.value.indexOf(option.id) !== -1}
          control={<Checkbox style={{ padding: '0 12px' }} />}
          disabled={readOnly}
          key={option.id}
          label={
            <b>
              <div
                style={
                  option.correct &&
                  readOnly &&
                  (showMcqMrqSolution || graderView)
                    ? { backgroundColor: green[50], verticalAlign: 'middle' }
                    : { verticalAlign: 'middle' }
                }
                dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              />
            </b>
          }
          onChange={(event, isInputChecked) => {
            const newValue = [...input.value];
            if (isInputChecked) {
              newValue.push(option.id);
            } else {
              newValue.splice(newValue.indexOf(option.id), 1);
            }
            return input.onChange(newValue);
          }}
          style={{ width: '100%' }}
          value={option.id.toString()}
        />
      ))}
    </>
  );
}

MultipleResponseOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

MultipleResponseOptions.defaultProps = {
  readOnly: false,
};

function MultipleResponse({
  question,
  readOnly,
  showMcqMrqSolution,
  graderView,
  answerId,
}) {
  return (
    <Field
      name={`${answerId}[option_ids]`}
      component={MultipleResponseOptions}
      {...{ question, readOnly, showMcqMrqSolution, graderView }}
    />
  );
}

MultipleResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleResponse;
