import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Radio, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import PropTypes from 'prop-types';

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
        key={option.id}
        checked={value && value.length > 0 && option.id === value[0]}
        control={<Radio />}
        disabled={readOnly}
        label={
          <b>
            <Typography
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              style={
                option.correct && readOnly && (showMcqMrqSolution || graderView)
                  ? {
                      backgroundColor: green[50],
                      verticalAlign: 'middle',
                    }
                  : { verticalAlign: 'middle' }
              }
              variant="body2"
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

const MultipleChoice = (props) => {
  const { question, readOnly, showMcqMrqSolution, graderView, answerId } =
    props;
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={`${answerId}.option_ids`}
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
