import {
  AttachmentType,
  TextResponseQuestionFormData,
} from 'types/course/assessment/question/text-responses';

export const getAttachmentTypeFromMaxAttachment = (
  maxAttachment: number | undefined,
): AttachmentType => {
  if (!maxAttachment || maxAttachment === 0) {
    return AttachmentType.NO_ATTACHMENT;
  }

  if (maxAttachment === 1) {
    return AttachmentType.SINGLE_FILE_ATTACHMENT;
  }

  return AttachmentType.MULTIPLE_FILE_ATTACHMENTS;
};

export const getMaxAttachmentFromAttachmentType = (
  question: TextResponseQuestionFormData,
): number => {
  if (question.attachmentType === AttachmentType.NO_ATTACHMENT) {
    return 0;
  }

  if (question.attachmentType === AttachmentType.SINGLE_FILE_ATTACHMENT) {
    return 1;
  }

  return question.maxAttachments;
};

export const getMaxAttachmentSize = (
  question: TextResponseQuestionFormData,
): number | null => {
  if (question.attachmentType === AttachmentType.NO_ATTACHMENT) {
    return null;
  }

  return question.maxAttachmentSize;
};
