import { defineMessages, FormattedMessage } from 'react-intl';
import { AttachmentType } from 'types/course/assessment/question/text-responses';

const translations = defineMessages({
  onlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.onlyOneFileUploadAllowed',
    defaultMessage: '*You can only upload at most 1 file in this question',
  },
  exactlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.exactlyOneFileUploadAllowed',
    defaultMessage: '*You must upload EXACTLY one file in this question',
  },
  atLeastOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.atLeastOneFileUploadAllowed',
    defaultMessage: '*You must upload AT LEAST one file in this question',
  },
  attachmentRequired: {
    id: 'course.assessment.submission.FileInput.attachmentRequired',
    defaultMessage: '*Attachment is required for this question',
  },
});

export const attachmentRequirementMessage = (
  attachmentType: AttachmentType,
  requireAttachment: boolean,
): JSX.Element | null => {
  if (
    attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT &&
    requireAttachment
  ) {
    return <FormattedMessage {...translations.exactlyOneFileUploadAllowed} />;
  }

  if (attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT) {
    return <FormattedMessage {...translations.onlyOneFileUploadAllowed} />;
  }

  if (requireAttachment) {
    return <FormattedMessage {...translations.atLeastOneFileUploadAllowed} />;
  }

  return null;
};
