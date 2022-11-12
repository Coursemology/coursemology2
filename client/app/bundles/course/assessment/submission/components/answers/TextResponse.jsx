import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import FormRichTextField from 'lib/components/form/fields/RichTextField';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import FileInput from '../FileInput';
import TextResponseSolutions from '../TextResponseSolutions';

const TextResponse = (props) => {
  const { question, readOnly, answerId, graderView } = props;
  const { control } = useFormContext();
  const allowUpload = question.allowAttachment;

  const readOnlyAnswer = (
    <Controller
      control={control}
      name={`${answerId}.answer_text`}
      render={({ field }) => (
        <div dangerouslySetInnerHTML={{ __html: field.value }} />
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
          field={field}
          fieldState={fieldState}
          fullWidth={true}
          InputLabelProps={{
            shrink: true,
          }}
          multiline={true}
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
          onChange={field.onChange}
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
          control={control}
          disabled={readOnly}
          name={`${answerId}.files`}
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
};

export default TextResponse;
