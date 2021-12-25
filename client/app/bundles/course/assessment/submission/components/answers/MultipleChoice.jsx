import { RadioButton } from 'material-ui/RadioButton';
import { green50 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { questionShape } from '../../propTypes';

const MultipleChoiceOptions = ({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  input: { onChange, value },
}) => (
  <>
    {question.options.map((option) => (
      <RadioButton
        key={option.id}
        checked={option.id === value}
        disabled={readOnly}
        label={
          <div
            dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            style={
              option.correct && readOnly && (showMcqMrqSolution || graderView)
                ? { backgroundColor: green50 }
                : null
            }
          />
        }
        onCheck={(_event, buttonValue) => onChange(buttonValue)}
        value={option.id}
      />
    ))}
  </>
);

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

const MultipleChoice = ({
  question,
  readOnly,
  showMcqMrqSolution,
  graderView,
  answerId,
}) => (
  <Field
    component={MultipleChoiceOptions}
    name={`${answerId}[option_ids][0]`}
    {...{ question, readOnly, showMcqMrqSolution, graderView }}
  />
);

MultipleChoice.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleChoice;
