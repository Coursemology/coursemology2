import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import FormRichTextField from 'lib/components/form/fields/RichTextField';

interface RubricBasedResponseAnswerProps {
  answerId: number;
  question: SubmissionQuestionData<'RubricBasedResponse'>;
  readOnly: boolean;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

const RubricBasedResponseAnswer: FC<RubricBasedResponseAnswerProps> = (
  props,
) => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;

  const { control } = useFormContext();

  const readOnlyAnswer = (
    <Controller
      control={control}
      name={`${answerId}.answer_text`}
      render={({ field }) => (
        <Typography
          dangerouslySetInnerHTML={{ __html: field.value }}
          variant="body2"
        />
      )}
    />
  );

  const editableAnswer = (
    <Controller
      control={control}
      name={`${answerId}.answer_text`}
      render={({ field, fieldState }) => (
        <FormRichTextField
          disabled={readOnly}
          field={{
            ...field,
            onChange: (event) => {
              field.onChange(event);
              saveAnswerAndUpdateClientVersion(answerId);
            },
          }}
          fieldState={fieldState}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          multiline
          renderIf={!readOnly && !question.autogradable}
          variant="standard"
        />
      )}
    />
  );

  return <div>{readOnly ? readOnlyAnswer : editableAnswer}</div>;
};

export default RubricBasedResponseAnswer;
