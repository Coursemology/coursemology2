import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from 'course/assessment/submission/components/answers/types';

import { validateAttachmentInAnswer } from './AttachmentValidation';
import { ErrorStruct, ErrorType } from './types';

export const validateBasedOnQuestionType = (
  question: SubmissionQuestionData<keyof typeof QuestionType>,
  attachments: Attachment[],
): ErrorStruct => {
  const errors: (ErrorType | null)[] = [];

  switch (question.type) {
    case QuestionType.TextResponse: {
      errors.push(
        validateAttachmentInAnswer(
          question as SubmissionQuestionData<'TextResponse'>,
          attachments,
        ),
      );
      break;
    }
    case QuestionType.FileUpload: {
      errors.push(
        validateAttachmentInAnswer(
          question as SubmissionQuestionData<'FileUpload'>,
          attachments,
        ),
      );
      break;
    }
    default: {
      break;
    }
  }

  const filteredErrors = errors.filter(
    (error) => error !== null,
  ) as ErrorType[];

  return {
    questionNumber: question.questionNumber,
    errorTypes: filteredErrors,
  };
};
