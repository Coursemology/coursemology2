import { memo } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Checkbox } from '@mui/material';
import { green } from '@mui/material/colors';
import propsAreEqual from 'lib/components/form/fields/utils/propsAreEqual';
import { questionShape } from '../../propTypes';

const MultipleResponseOptions = ({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  field: { onChange, value },
}) => (
  <>
    {question.options.map((option) => (
      <FormControlLabel
        checked={value.indexOf(option.id) !== -1}
        control={<Checkbox style={{ padding: '0 12px' }} />}
        disabled={readOnly}
        key={option.id}
        label={
          <b>
            <div
              style={
                option.correct && readOnly && (showMcqMrqSolution || graderView)
                  ? { backgroundColor: green[50], verticalAlign: 'middle' }
                  : { verticalAlign: 'middle' }
              }
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          </b>
        }
        onChange={(event, isInputChecked) => {
          const newValue = [...value];
          if (isInputChecked) {
            newValue.push(option.id);
          } else {
            newValue.splice(newValue.indexOf(option.id), 1);
          }
          return onChange(newValue);
        }}
        style={{ width: '100%' }}
        value={option.id.toString()}
      />
    ))}
  </>
);

MultipleResponseOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  field: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

MultipleResponseOptions.defaultProps = {
  readOnly: false,
};

const MemoMultipleResponseOptions = memo(
  MultipleResponseOptions,
  (prevProps, nextProps) => {
    const { id: prevId } = prevProps.question;
    const { id: nextId } = nextProps.question;
    const { graderView: prevGraderView } = prevProps.graderView;
    const { graderView: nextGraderView } = nextProps.graderView;
    const isQuestionIdUnchanged = prevId === nextId;
    const isGraderViewUnchanged = prevGraderView === nextGraderView;
    return (
      isQuestionIdUnchanged &&
      isGraderViewUnchanged &&
      propsAreEqual(prevProps, nextProps)
    );
  },
);

const MultipleResponse = (props) => {
  const { question, readOnly, showMcqMrqSolution, graderView, answerId } =
    props;
  const { control } = useFormContext();

  return (
    <Controller
      name={`${answerId}.option_ids`}
      control={control}
      render={({ field, fieldState }) => (
        <MemoMultipleResponseOptions
          field={field}
          fieldState={fieldState}
          {...{ question, readOnly, showMcqMrqSolution, graderView }}
        />
      )}
    />
  );
};

MultipleResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleResponse;
