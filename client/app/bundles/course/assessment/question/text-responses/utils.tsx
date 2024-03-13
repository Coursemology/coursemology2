import {
  AttachmentType,
  TextResponseQuestionFormData,
} from 'types/course/assessment/question/text-responses';

export const getAttachmentTypeFromMaxAttachment = (
  maxAttachments: number | undefined,
): AttachmentType => {
  if (!maxAttachments || maxAttachments === 0) {
    return AttachmentType.NO_ATTACHMENT;
  }

  if (maxAttachments === 1) {
    return AttachmentType.SINGLE_ATTACHMENT;
  }

  return AttachmentType.MULTIPLE_ATTACHMENT;
};

export const getMaxAttachmentFromAttachmentType = (
  question: TextResponseQuestionFormData,
): number => {
  if (question.attachmentType === AttachmentType.NO_ATTACHMENT) {
    return 0;
  }

  if (question.attachmentType === AttachmentType.SINGLE_ATTACHMENT) {
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
