import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import RichTextField from 'lib/components/redux-form/RichTextField';

import { questionShape } from '../../propTypes';
import UploadedFileView from '../../containers/UploadedFileView';
import TextResponseSolutions from '../TextResponseSolutions';
import FileInput from '../FileInput';
import {fetchAllPosts} from "../../../../forum/actions/all-posts";

fetchAllPosts()

function TextResponse({ question, readOnly, answerId, graderView }) {
  const allowUpload = question.allowAttachment;

  const readOnlyAnswer = (
    <Field
      name={`${answerId}[answer_text]`}
      component={(props) => (
        <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
      )}
    />
  );

  const richtextAnswer = (
    <Field
      name={`${answerId}[answer_text]`}
      component={RichTextField}
      multiLine
    />
  );

  const plaintextAnswer = (
    <Field
      name={`${answerId}[answer_text]`}
      component="textarea"
      style={{ width: '100%' }}
      rows={5}
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
        <FileInput name={`${answerId}[files]`} disabled={readOnly} />
      )}
    </div>
  );
}

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
