import { useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { questionShape } from 'course/assessment/submission/propTypes';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import NotificationBar from 'lib/components/NotificationBar';
import Error from 'lib/components/ErrorCard';
import ForumPostSelect from './ForumPostSelect';

const ForumPostResponse = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const { question, readOnly, answerId } = props;
  const { control } = useFormContext();
  const renderTextField = () =>
    readOnly ? (
      <Controller
        name={`${answerId}.answer_text`}
        control={control}
        render={({ field }) => (
          <div dangerouslySetInnerHTML={{ __html: field.value }} />
        )}
      />
    ) : (
      <Controller
        name={`${answerId}.answer_text`}
        control={control}
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
        name={`${answerId}.selected_post_packs`}
        control={control}
        render={({ field }) => (
          <ForumPostSelect
            field={field}
            question={question}
            readOnly={readOnly}
            answerId={answerId}
            onErrorMessage={(message) => setErrorMessage(message)}
            handleNotificationMessage={(message) =>
              setNotificationMessage(message)
            }
          />
        )}
      />
      {question.hasTextResponse && renderTextField(readOnly, answerId)}
      {errorMessage && <Error message={errorMessage} />}
      <NotificationBar
        open={notificationMessage !== ''}
        notification={{ message: notificationMessage }}
        autoHideDuration={4000}
        onClose={() => setNotificationMessage('')}
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
