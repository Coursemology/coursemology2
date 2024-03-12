import { connect } from 'react-redux';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { useAppSelector } from 'lib/hooks/store';

import UploadedFileView from '../../../containers/UploadedFileView';
import { questionShape } from '../../../propTypes';
import { getIsSavingAnswer } from '../../../selectors/answerFlags';
import FileInputField from '../../FileInput';
import { attachmentRequirementMessage } from '../utils';

const FileUpload = ({
  numAttachments,
  question,
  readOnly,
  answerId,
  handleUploadTextResponseFiles,
}) => {
  const isSaving = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );
  const disableField = readOnly || isSaving;
  const { maxAttachments, isAttachmentRequired } = question;
  const isMultipleAttachmentsAllowed = maxAttachments - numAttachments > 1;
  const isFileUploadStillAllowed = maxAttachments > numAttachments;

  return (
    <div>
      <UploadedFileView answerId={answerId} questionId={question.id} />
      {!readOnly && (
        <FileInputField
          disabled={disableField || !isFileUploadStillAllowed}
          isMultipleAttachmentsAllowed={isMultipleAttachmentsAllowed}
          maxAttachmentsAllowed={maxAttachments - numAttachments}
          name={`${answerId}.files`}
          numAttachments={numAttachments}
          onChangeCallback={() => handleUploadTextResponseFiles(answerId)}
        />
      )}
      <Typography variant="body2">
        {attachmentRequirementMessage(maxAttachments, isAttachmentRequired)}
      </Typography>
    </div>
  );
};

FileUpload.propTypes = {
  answerId: PropTypes.number.isRequired,
  handleUploadTextResponseFiles: PropTypes.func.isRequired,
  numAttachments: PropTypes.number,
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { question } = ownProps;

  return {
    numAttachments:
      state.assessments.submission.attachments[question.id]?.length ?? 0,
  };
}

export default connect(mapStateToProps)(FileUpload);
