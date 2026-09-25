import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import UserHTMLText from 'lib/components/core/UserHTMLText';
import FormRichTextField from 'lib/components/form/fields/RichTextField';

interface RubricBasedResponseAnswerProps {
  answerId: number;
  readOnly: boolean;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

const RubricBasedResponseAnswer: FC<RubricBasedResponseAnswerProps> = (
  props,
) => {
  const { answerId, readOnly, saveAnswerAndUpdateClientVersion } = props;

  const { control } = useFormContext();

  const readOnlyAnswer = (
    <Controller
      control={control}
      name={`${answerId}.answer_text`}
      render={({ field }) => <UserHTMLText html={field.value} />}
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
          renderIf={!readOnly}
          variant="standard"
        />
      )}
    />
  );

  return <div>{readOnly ? readOnlyAnswer : editableAnswer}</div>;
};

export default RubricBasedResponseAnswer;
