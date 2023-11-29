import { Controller, useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import FormRichTextField from 'lib/components/form/fields/RichTextField';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import { getCurrentTime } from '../../utils';
import FileInput from '../FileInput';
import TextResponseSolutions from '../TextResponseSolutions';

const TextResponse = (props) => {
  const { question, readOnly, answerId, graderView, saveAnswer } = props;
  const { control, getValues } = useFormContext();
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
            onChange: (event, editor) => {
              field.onChange(editor !== undefined ? editor.getData() : event);
              const modifiedAnswer = { [answerId]: getValues()[answerId] };
              const curTime = getCurrentTime();
              saveAnswer(modifiedAnswer, answerId, curTime);
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
            const modifiedAnswer = { [answerId]: getValues()[answerId] };
            saveAnswer(modifiedAnswer, answerId);
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
      {allowUpload && <UploadedFileView questionId={question.id} />}
      {allowUpload && !readOnly && (
        <FileInput
          answerId={answerId}
          control={control}
          disabled={readOnly}
          name={`${answerId}.files`}
          saveAnswer={saveAnswer}
        />
      )}
    </div>
  );
};

TextResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  graderView: PropTypes.bool,
  field: PropTypes.shape({
    value: PropTypes.string,
  }),
  saveAnswer: PropTypes.func,
};

export default TextResponse;
