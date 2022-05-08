import { memo } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Radio } from '@mui/material';
import { green } from '@mui/material/colors';
import propsAreEqual from 'lib/components/form/fields/utils/propsAreEqual';
import { questionShape } from '../../propTypes';

const MultipleChoiceOptions = ({
  readOnly,
  showMcqMrqSolution,
  graderView,
  question,
  field: { onChange, value },
}) => (
  <>
    {question.options.map((option) => (
      <FormControlLabel
        checked={option.id === value[0]}
        control={<Radio style={{ padding: '0 12px' }} />}
        disabled={readOnly}
        key={option.id}
        label={
          <b>
            <div
              style={
                option.correct && readOnly && (showMcqMrqSolution || graderView)
                  ? { backgroundColor: green[50] }
                  : null
              }
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
            />
          </b>
        }
        onChange={(event) => {
          onChange([parseInt(event.target.value, 10)]);
        }}
        style={{ width: '100%' }}
        value={option.id.toString()}
      />
    ))}
  </>
);

MultipleChoiceOptions.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  field: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

const MemoMultipleChoiceOptions = memo(
  MultipleChoiceOptions,
  (prevProps, nextProps) => {
    const { id: prevId } = prevProps.question;
    const { id: nextId } = nextProps.question;
    const { graderView: prevGraderView } = prevProps.readOnly;
    const { graderView: nextGraderView } = nextProps.readOnly;
    const isQuestionIdUnchanged = prevId === nextId;
    const isGraderViewUnchanged = prevGraderView === nextGraderView;
    return (
      isQuestionIdUnchanged &&
      isGraderViewUnchanged &&
      propsAreEqual(prevProps, nextProps)
    );
  },
);

const MultipleChoice = (props) => {
  const { question, readOnly, showMcqMrqSolution, graderView, answerId } =
    props;
  const { control } = useFormContext();

  return (
    <Controller
      name={`${answerId}.option_ids`}
      control={control}
      render={({ field, fieldState }) => (
        <MemoMultipleChoiceOptions
          field={field}
          fieldState={fieldState}
          {...{ question, readOnly, showMcqMrqSolution, graderView }}
        />
      )}
    />
  );
};

MultipleChoice.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  graderView: PropTypes.bool,
  answerId: PropTypes.number,
};

export default MultipleChoice;
