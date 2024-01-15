import PropTypes from 'prop-types';

import { useAppSelector } from 'lib/hooks/store';

import UploadedFileView from '../../../containers/UploadedFileView';
import { questionShape } from '../../../propTypes';
import { getIsSavingAnswer } from '../../../selectors/answerFlags';
import FileInputField from '../../FileInput';

const FileUpload = ({
  question,
  readOnly,
  answerId,
  handleUploadTextResponseFiles,
}) => {
  const isSaving = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );
  const disableField = readOnly || isSaving;

  return (
    <div>
      <UploadedFileView answerId={answerId} questionId={question.id} />
      {!readOnly && (
        <FileInputField
          disabled={disableField}
          name={`${answerId}.files`}
          onChangeCallback={() => handleUploadTextResponseFiles(answerId)}
        />
      )}
    </div>
  );
};

FileUpload.propTypes = {
  answerId: PropTypes.number.isRequired,
  handleUploadTextResponseFiles: PropTypes.func.isRequired,
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default FileUpload;
