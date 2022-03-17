import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormControlLabel, Radio } from '@mui/material';
import { green } from '@mui/material/colors';
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
        <FormControlLabel
          checked={option.id === value}
          control={<Radio style={{ padding: '0 12px' }} />}
          disabled={readOnly}
          key={option.id}
          label={
            <b>
              <div
                style={
                  option.correct &&
                  readOnly &&
                  (showMcqMrqSolution || graderView)
                    ? { backgroundColor: green[50] }
                    : null
                }
                dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              />
            </b>
          }
          onChange={(event) => {
            onChange(parseInt(event.target.value, 10));
          }}
          style={{ width: '100%' }}
          value={option.id.toString()}
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
    value: PropTypes.string,
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
