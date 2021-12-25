import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import RichTextField from 'lib/components/redux-form/RichTextField';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import FileInput from '../FileInput';
import TextResponseSolutions from '../TextResponseSolutions';

const ReadOnlyAnswerComponent = (props) => (
  <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
);

ReadOnlyAnswerComponent.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};

const TextResponse = ({ question, readOnly, answerId, graderView }) => {
  const allowUpload = question.allowAttachment;

  const readOnlyAnswer = (
    <Field
      component={ReadOnlyAnswerComponent}
      name={`${answerId}[answer_text]`}
    />
  );

  const richtextAnswer = (
    <Field
      component={RichTextField}
      multiLine={true}
      name={`${answerId}[answer_text]`}
    />
  );

  const plaintextAnswer = (
    <Field
      component="textarea"
      name={`${answerId}[answer_text]`}
      rows={5}
      style={{ width: '100%' }}
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
        <FileInput disabled={readOnly} name={`${answerId}[files]`} />
      )}
    </div>
  );
};

TextResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  graderView: PropTypes.bool,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};

export default TextResponse;
