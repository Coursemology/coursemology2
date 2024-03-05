import { AttachmentType } from 'types/course/assessment/question/text-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from 'course/assessment/submission/components/answers/types';

import { ErrorStruct, ErrorType } from './types';

export const validateAttachmentInAnswer = (
  errors: Record<number, ErrorStruct>,
  answerId: number,
  question:
    | SubmissionQuestionData<'TextResponse'>
    | SubmissionQuestionData<'FileUpload'>,
  attachments: Attachment[],
): void => {
  const isAttachmentRequired = question.isAttachmentRequired;
  const onlyOneAttachmentAllowed =
    question.attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT;

  if (isAttachmentRequired && attachments.length === 0) {
    errors[answerId] = {
      questionNumber: question.questionNumber,
      errorCode: ErrorType.AttachmentRequired,
    };
  }

  if (onlyOneAttachmentAllowed && attachments.length > 1) {
    errors[answerId] = {
      questionNumber: question.questionNumber,
      errorCode: ErrorType.AtMostOneAttachmentAllowed,
    };
  }
};
