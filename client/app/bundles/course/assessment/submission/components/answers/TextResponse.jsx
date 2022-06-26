import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import { questionShape } from '../../propTypes';
import UploadedFileView from '../../containers/UploadedFileView';
import TextResponseSolutions from '../TextResponseSolutions';
import FileInput from '../FileInput';

const TextResponse = (props) => {
  const { question, readOnly, answerId, graderView } = props;
  const { control } = useFormContext();
  const allowUpload = question.allowAttachment;

  const readOnlyAnswer = (
    <Controller
      name={`${answerId}.answer_text`}
      control={control}
      render={({ field }) => (
        <div dangerouslySetInnerHTML={{ __html: field.value }} />
      )}
    />
  );

  const richtextAnswer = (
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
          renderIf={!readOnly && !question.autogradable}
          variant="standard"
          disabled={readOnly}
        />
      )}
    />
  );

  const plaintextAnswer = (
    <Controller
      name={`${answerId}.answer_text`}
      control={control}
      render={({ field }) => (
        <textarea
          name={`${answerId}.answer_text`}
          onChange={field.onChange}
          value={field.value || ''}
          style={{ width: '100%' }}
          rows={5}
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
          name={`${answerId}.files`}
          disabled={readOnly}
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
