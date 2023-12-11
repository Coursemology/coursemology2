import PropTypes from 'prop-types';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import FileInput from '../FileInput';

const FileUpload = ({
  question,
  readOnly,
  answerId,
  isSavingAnswer,
  // saveAnswer,
  uploadFiles,
}) => (
  <div>
    <UploadedFileView questionId={question.id} />
    {!readOnly ? (
      <FileInput
        answerId={answerId}
        disabled={readOnly || isSavingAnswer}
        name={`${answerId}.files`}
        saveAnswer={uploadFiles}
      />
    ) : null}
  </div>
);

FileUpload.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  isSavingAnswer: PropTypes.bool,
  // saveAnswer: PropTypes.func,
  uploadFiles: PropTypes.func,
};

export default FileUpload;
