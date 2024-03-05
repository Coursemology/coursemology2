import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from 'course/assessment/submission/components/answers/types';

import { validateAttachmentInAnswer } from './AttachmentValidation';
import { ErrorStruct } from './types';

export const validateBasedOnQuestionType = (
  errors: Record<number, ErrorStruct>,
  answer: AnswerData,
  questions: SubmissionQuestionData<keyof typeof QuestionType>[],
  attachments: Attachment[],
): void => {
  switch (answer.questionType) {
    case QuestionType.TextResponse: {
      validateAttachmentInAnswer(
        errors,
        answer.id,
        questions[answer.questionId] as SubmissionQuestionData<'TextResponse'>,
        attachments,
      );
      break;
    }
    case QuestionType.FileUpload: {
      validateAttachmentInAnswer(
        errors,
        answer.id,
        questions[answer.questionId] as SubmissionQuestionData<'FileUpload'>,
        attachments,
      );
      break;
    }
    default: {
      break;
    }
  }
};
