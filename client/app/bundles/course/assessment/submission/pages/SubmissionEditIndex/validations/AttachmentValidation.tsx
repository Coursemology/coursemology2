import { AttachmentType } from 'types/course/assessment/question/text-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from 'course/assessment/submission/components/answers/types';

import { ErrorType } from './types';

export const validateAttachmentInAnswer = (
  question:
    | SubmissionQuestionData<'TextResponse'>
    | SubmissionQuestionData<'FileUpload'>,
  attachments: Attachment[],
): ErrorType => {
  const isAttachmentRequired = question.isAttachmentRequired;
  const onlyOneAttachmentAllowed =
    question.attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT;

  if (isAttachmentRequired && attachments.length === 0) {
    return ErrorType.AttachmentRequired;
  }

  if (onlyOneAttachmentAllowed && attachments.length > 1) {
    return ErrorType.AtMostOneAttachmentAllowed;
  }

  return ErrorType.NoError;
};
