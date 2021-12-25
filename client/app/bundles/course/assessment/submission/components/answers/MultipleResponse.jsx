import Checkbox from 'material-ui/Checkbox';
import { green50 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { questionShape } from '../../propTypes';

const MultipleResponseOptions = ({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  input,
}) => (
  <>
    {question.options.map((option) => (
      <Checkbox
        key={option.id}
        checked={input.value.indexOf(option.id) !== -1}
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
        labelStyle={{ verticalAlign: 'middle' }}
        onCheck={(_event, isInputChecked) => {
          const newValue = [...input.value];
          if (isInputChecked) {
            newValue.push(option.id);
          } else {
            newValue.splice(newValue.indexOf(option.id), 1);
          }
          return input.onChange(newValue);
        }}
        value={option.id}
      />
    ))}
  </>
);

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

const MultipleResponse = ({
  question,
  readOnly,
  showMcqMrqSolution,
  graderView,
  answerId,
}) => (
  <Field
    component={MultipleResponseOptions}
    name={`${answerId}[option_ids]`}
    {...{ question, readOnly, showMcqMrqSolution, graderView }}
  />
);

MultipleResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleResponse;
