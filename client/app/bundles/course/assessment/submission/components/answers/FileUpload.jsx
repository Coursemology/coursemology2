import React from 'react';
import PropTypes from 'prop-types';

import { questionShape } from '../../propTypes';
import UploadedFileView from '../../containers/UploadedFileView';
import FileInput from '../FileInput';

function FileUpload({ question, readOnly, answerId }) {
  return (
    <div>
      <UploadedFileView questionId={question.id} />
      {!readOnly ? <FileInput name={`${answerId}[files]`} disabled={readOnly} /> : null}
    </div>
  );
}

FileUpload.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
};

export default FileUpload;
