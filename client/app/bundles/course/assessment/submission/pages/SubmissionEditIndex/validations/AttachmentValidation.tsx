import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from 'course/assessment/submission/components/answers/types';

import { ErrorType } from './types';

export const validateAttachmentInAnswer = (
  question:
    | SubmissionQuestionData<'TextResponse'>
    | SubmissionQuestionData<'FileUpload'>,
  attachments: Attachment[],
): ErrorType => {
  if (question.isAttachmentRequired && attachments.length === 0) {
    return ErrorType.AttachmentRequired;
  }

  return ErrorType.NoError;
};
