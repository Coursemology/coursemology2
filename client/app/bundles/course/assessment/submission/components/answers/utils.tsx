import { defineMessages, FormattedMessage } from 'react-intl';
import { AttachmentType } from 'types/course/assessment/question/text-responses';

const translations = defineMessages({
  onlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.onlyOneFileUploadAllowed',
    defaultMessage: '*You can only upload AT MOST 1 file for this question',
  },
  exactlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.exactlyOneFileUploadAllowed',
    defaultMessage: '*You must upload EXACTLY 1 file for this question',
  },
  atLeastOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.atLeastOneFileUploadAllowed',
    defaultMessage: '*You must upload AT LEAST 1 file for this question',
  },
});

export const attachmentRequirementMessage = (
  attachmentType: AttachmentType,
  isAttachmentRequired: boolean,
): JSX.Element | null => {
  if (
    attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT &&
    isAttachmentRequired
  ) {
    return <FormattedMessage {...translations.exactlyOneFileUploadAllowed} />;
  }

  if (
    attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT &&
    !isAttachmentRequired
  ) {
    return <FormattedMessage {...translations.onlyOneFileUploadAllowed} />;
  }

  if (isAttachmentRequired) {
    return <FormattedMessage {...translations.atLeastOneFileUploadAllowed} />;
  }

  return null;
};
