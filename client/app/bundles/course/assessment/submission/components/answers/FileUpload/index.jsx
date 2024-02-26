import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { AttachmentType } from 'types/course/assessment/question/text-responses';

import { useAppSelector } from 'lib/hooks/store';

import UploadedFileView from '../../../containers/UploadedFileView';
import { questionShape } from '../../../propTypes';
import { getIsSavingAnswer } from '../../../selectors/answerFlags';
import FileInputField from '../../FileInput';

const translations = defineMessages({
  onlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.onlyOneFileUploadAllowed',
    defaultMessage: '*You can only upload at most one file in this question',
  },
  attachmentRequired: {
    id: 'course.assessment.submission.FileInput.attachmentRequired',
    defaultMessage: '*Attachment is required for this question',
  },
});

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
  const attachmentType = question.attachmentType;
  const attachmentExists = numAttachments > 0;
  const requireAttachment = question.requireAttachment;

  return (
    <div>
      <UploadedFileView answerId={answerId} questionId={question.id} />
      {!readOnly && (
        <FileInputField
          attachmentExists={attachmentExists}
          attachmentType={attachmentType}
          disabled={disableField}
          name={`${answerId}.files`}
          onChangeCallback={() => handleUploadTextResponseFiles(answerId)}
        />
      )}
      {attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT && (
        <Typography variant="body2">
          <FormattedMessage {...translations.onlyOneFileUploadAllowed} />
        </Typography>
      )}
      {requireAttachment && (
        <Typography variant="body2">
          <FormattedMessage {...translations.attachmentRequired} />
        </Typography>
      )}
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
