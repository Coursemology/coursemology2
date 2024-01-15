import { Controller, useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import { useAppSelector } from 'lib/hooks/store';

import UploadedFileView from '../../../containers/UploadedFileView';
import { questionShape } from '../../../propTypes';
import { getIsSavingAnswer } from '../../../selectors/answerFlags';
import FileInputField from '../../FileInput';
import TextResponseSolutions from '../../TextResponseSolutions';

const TextResponse = (props) => {
  const {
    answerId,
    graderView,
    handleUploadTextResponseFiles,
    question,
    readOnly,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control } = useFormContext();
  const isSaving = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );
  const disableField = readOnly || isSaving;
  const allowUpload = question.allowAttachment;

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

  const richtextAnswer = (
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

  const plaintextAnswer = (
    <Controller
      control={control}
      name={`${answerId}.answer_text`}
      render={({ field }) => (
        <textarea
          name={`${answerId}.answer_text`}
          onChange={(e) => {
            field.onChange(e.target.value);
            saveAnswerAndUpdateClientVersion(answerId);
          }}
          rows={5}
          style={{ width: '100%' }}
          value={field.value || ''}
        />
      )}
    />
  );

  const editableAnswer = question.autogradable
    ? plaintextAnswer
    : richtextAnswer;

  return (
    <div>
      {readOnly ? readOnlyAnswer : editableAnswer}
      {graderView && <TextResponseSolutions question={question} />}
      {allowUpload && (
        <UploadedFileView answerId={answerId} questionId={question.id} />
      )}
      {allowUpload && !readOnly && (
        <FileInputField
          disabled={disableField}
          name={`${answerId}.files`}
          onChangeCallback={() => handleUploadTextResponseFiles(answerId)}
        />
      )}
    </div>
  );
};

TextResponse.propTypes = {
  answerId: PropTypes.number.isRequired,
  graderView: PropTypes.bool.isRequired,
  handleUploadTextResponseFiles: PropTypes.func.isRequired,
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
};

export default TextResponse;
