import PropTypes from 'prop-types';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import FileInput from '../FileInput';

const FileUpload = ({ question, readOnly, answerId, saveAnswer }) => (
  <div>
    <UploadedFileView questionId={question.id} />
    {!readOnly ? (
      <FileInput
        answerId={answerId}
        disabled={readOnly}
        name={`${answerId}.files`}
        saveAnswer={saveAnswer}
      />
    ) : null}
  </div>
);

FileUpload.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  saveAnswer: PropTypes.func,
};

export default FileUpload;
