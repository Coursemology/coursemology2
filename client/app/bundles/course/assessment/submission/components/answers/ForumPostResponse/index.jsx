import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { questionShape } from 'course/assessment/submission/propTypes';
import Error from 'lib/components/core/ErrorCard';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import toast from 'lib/hooks/toast';

import ForumPostSelect from './ForumPostSelect';

const ForumPostResponse = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const { question, readOnly, answerId, saveAnswer, savingIndicator } = props;
  const { control, getValues } = useFormContext();
  const renderTextField = () =>
    readOnly ? (
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
    ) : (
      <Controller
        control={control}
        name={`${answerId}.answer_text`}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={{
              ...field,
              onChange: (event, editor) => {
                field.onChange(editor !== undefined ? editor.getData() : event);
                saveAnswer(getValues()[answerId], answerId);
              },
            }}
            fieldState={fieldState}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            multiline
            renderIf={!readOnly && question.hasTextResponse}
            variant="standard"
          />
        )}
      />
    );
  return (
    <>
      <Controller
        control={control}
        name={`${answerId}.selected_post_packs`}
        render={({ field }) => (
          <ForumPostSelect
            answerId={answerId}
            field={{
              ...field,
              onChange: (event) => {
                field.onChange(event);
                saveAnswer(getValues()[answerId], answerId);
              },
            }}
            handleNotificationMessage={toast.info}
            onErrorMessage={(message) => setErrorMessage(message)}
            question={question}
            readOnly={readOnly}
            savingIndicator={savingIndicator}
          />
        )}
      />
      {question.hasTextResponse && renderTextField()}
      {errorMessage && <Error message={errorMessage} />}
    </>
  );
};

ForumPostResponse.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswer: PropTypes.func,
  savingIndicator: PropTypes.node,
};

export default ForumPostResponse;
