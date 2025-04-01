/* eslint-disable sonarjs/no-duplicated-branches */
import { QuestionType } from 'types/course/assessment/question';
import {
  AnswerData,
  AnswerFieldEntity,
} from 'types/course/assessment/submission/answer';

export const convertAnswerDataToInitialValue = (
  answer: AnswerData,
): AnswerFieldEntity | null => {
  switch (answer.questionType) {
    case QuestionType.MultipleChoice:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    case QuestionType.MultipleResponse:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    case QuestionType.Programming: {
      // "import_files" attribute is used as "staging" field
      // When the import_files is empty, it means the dropzone is empty
      return {
        ...answer.fields,
        questionType: answer.questionType,
        import_files: null,
      };
    }
    case QuestionType.TextResponse:
      // "files" attribute is used as "staging" field for the 2 different question types
      // When the file is empty, it means the dropzone is empty
      return {
        ...answer.fields,
        questionType: answer.questionType,
        files: null,
      };
    case QuestionType.FileUpload:
      return {
        ...answer.fields,
        questionType: answer.questionType,
        files: null,
      };
    case QuestionType.Scribing:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    case QuestionType.VoiceResponse:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    case QuestionType.ForumPostResponse:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    case QuestionType.RubricBasedResponse:
      return {
        ...answer.fields,
        questionType: answer.questionType,
      };
    default:
      return null;
  }
};

export const convertAnswersDataToInitialValues = (
  answers: AnswerData[],
): Record<number, AnswerFieldEntity | null> =>
  answers.reduce(
    (previousObj, answer) => ({
      ...previousObj,
      [answer.fields.id]: convertAnswerDataToInitialValue(answer),
    }),
    {},
  );

export const buildInitialClientVersion = (
  answers: AnswerData[],
): Record<number, number | null> =>
  answers.reduce(
    (previousObj, answer) => ({
      ...previousObj,
      [answer.id]: answer.clientVersion,
    }),
    {},
  );
