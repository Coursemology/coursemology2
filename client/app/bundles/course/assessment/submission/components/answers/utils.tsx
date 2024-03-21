import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  requiredUploadLimitedNumberOfFiles: {
    id: 'course.assessment.submission.FileInput.requiredUploadLimitedNumberOfFiles',
    defaultMessage:
      '*You can upload AT LEAST 1 and AT MOST {maxAttachments} files for this question',
  },
  limitedNumberOfFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.onlyOneFileUploadAllowed',
    defaultMessage:
      '*You can only upload AT MOST {maxAttachments} file for this question',
  },
  exactlyOneFileUploadAllowed: {
    id: 'course.assessment.submission.FileInput.exactlyOneFileUploadAllowed',
    defaultMessage: '*You must upload EXACTLY 1 file for this question',
  },
});

export const attachmentRequirementMessage = (
  maxAttachments: number,
  isAttachmentRequired: boolean,
): JSX.Element | null => {
  if (maxAttachments > 1 && isAttachmentRequired) {
    return (
      <FormattedMessage
        {...translations.requiredUploadLimitedNumberOfFiles}
        values={{ maxAttachments }}
      />
    );
  }

  if (maxAttachments === 1 && isAttachmentRequired) {
    return <FormattedMessage {...translations.exactlyOneFileUploadAllowed} />;
  }

  if (!isAttachmentRequired) {
    return (
      <FormattedMessage
        {...translations.limitedNumberOfFileUploadAllowed}
        values={{ maxAttachments }}
      />
    );
  }

  return null;
};
