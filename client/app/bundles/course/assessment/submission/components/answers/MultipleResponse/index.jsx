import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import PropTypes from 'prop-types';

import propsAreEqual from 'lib/components/form/fields/utils/propsAreEqual';

import { questionShape } from '../../../propTypes';

const MultipleResponseOptions = ({
  readOnly,
  showMcqMrqSolution,
  graderView,
  published,
  question,
  field: { onChange, value },
}) => (
  <>
    {question.options.map((option) => (
      <FormControlLabel
        key={option.id}
        checked={value.indexOf(option.id) !== -1}
        control={<Checkbox />}
        disabled={readOnly}
        label={
          <b>
            <Typography
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              style={
                option.correct &&
                readOnly &&
                (graderView || (published && showMcqMrqSolution))
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
        onChange={(_event, isInputChecked) => {
          const newValue = [...value];
          if (isInputChecked) {
            newValue.push(option.id);
          } else {
            newValue.splice(newValue.indexOf(option.id), 1);
          }
          // Need to ensure the options are sorted since react-hook-form would check
          // the content of an array with the same values but different order as different
          newValue.sort((a, b) => a - b);
          onChange(newValue);
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
  published: PropTypes.bool,
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
    const prevGraderView = prevProps.graderView;
    const nextGraderView = nextProps.graderView;
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
  const {
    answerId,
    graderView,
    published,
    question,
    readOnly,
    saveAnswerAndUpdateClientVersion,
    showMcqMrqSolution,
  } = props;
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={`${answerId}.option_ids`}
      render={({ field, fieldState }) => (
        <MemoMultipleResponseOptions
          field={{
            ...field,
            onChange: (event) => {
              field.onChange(event);
              saveAnswerAndUpdateClientVersion(answerId);
            },
          }}
          fieldState={fieldState}
          {...{ question, readOnly, showMcqMrqSolution, graderView, published }}
        />
      )}
    />
  );
};

MultipleResponse.propTypes = {
  answerId: PropTypes.number.isRequired,
  graderView: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
  showMcqMrqSolution: PropTypes.bool.isRequired,
};

export default MultipleResponse;
