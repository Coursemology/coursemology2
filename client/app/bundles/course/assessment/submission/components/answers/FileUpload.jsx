import PropTypes from 'prop-types';

import UploadedFileView from '../../containers/UploadedFileView';
import { questionShape } from '../../propTypes';
import FileInput from '../FileInput';

const FileUpload = ({ question, readOnly, answerId }) => (
  <div>
    <UploadedFileView questionId={question.id} />
    {!readOnly ? (
      <FileInput disabled={readOnly} name={`${answerId}.files`} />
    ) : null}
  </div>
);

FileUpload.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
};

export default FileUpload;
