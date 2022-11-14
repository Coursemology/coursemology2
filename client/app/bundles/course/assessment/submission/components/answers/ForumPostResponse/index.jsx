import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import { questionShape } from 'course/assessment/submission/propTypes';
import Error from 'lib/components/core/ErrorCard';
import NotificationBar from 'lib/components/core/NotificationBar';
import FormRichTextField from 'lib/components/form/fields/RichTextField';

import ForumPostSelect from './ForumPostSelect';

const ForumPostResponse = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const { question, readOnly, answerId } = props;
  const { control } = useFormContext();
  const renderTextField = () =>
    readOnly ? (
      <Controller
        control={control}
        name={`${answerId}.answer_text`}
        render={({ field }) => (
          <div dangerouslySetInnerHTML={{ __html: field.value }} />
        )}
      />
    ) : (
      <Controller
        control={control}
        name={`${answerId}.answer_text`}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
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
            field={field}
            handleNotificationMessage={(message) =>
              setNotificationMessage(message)
            }
            onErrorMessage={(message) => setErrorMessage(message)}
            question={question}
            readOnly={readOnly}
          />
        )}
      />
      {question.hasTextResponse && renderTextField()}
      {errorMessage && <Error message={errorMessage} />}
      <NotificationBar
        autoHideDuration={4000}
        notification={{ message: notificationMessage }}
        onClose={() => setNotificationMessage('')}
        open={notificationMessage !== ''}
      />
    </>
  );
};

ForumPostResponse.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
};

export default ForumPostResponse;
