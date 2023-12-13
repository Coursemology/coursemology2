import { FieldValues, UseFormSetValue } from 'react-hook-form';

import { SubmissionQuestionData } from './questionGrade';

interface AnswerCommonProps {
  question: SubmissionQuestionData;
  readOnly: boolean;
  answerId: number;
}

export interface ScribingAnswerProps extends AnswerCommonProps {
  type: 'Scribing';
}

export interface McqMrqAnswerProps extends AnswerCommonProps {
  type: 'MultipleChoice' | 'MultipleResponse';
  showMcqMrqSolution: boolean;
  graderView: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
}

export interface TextAnswerProps extends AnswerCommonProps {
  type: 'TextResponse' | 'Comprehension';
  saveAnswer: (data: unknown, answerId: number) => void;
  uploadFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
  graderView: boolean;
}

export interface FileUploadAnswerProps extends AnswerCommonProps {
  type: 'FileUpload';
  uploadFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
  graderView: boolean;
}

export interface ProgrammingAnswerProps extends AnswerCommonProps {
  type: 'Programming';
  saveAnswer: (data: unknown, answerId: number) => void;
  importFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    language: string,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
}

export interface ForumResponseAnswerProps extends AnswerCommonProps {
  type: 'ForumPostResponse';
  saveAnswer: (data: unknown, answerId: number) => void;
  savingIndicator: React.ReactNode | null;
}

export interface VoiceResponseAnswerProps extends AnswerCommonProps {
  type: 'VoiceResponse';
  saveAnswer: (data: unknown, answerId: number) => void;
  savingIndicator: React.ReactNode | null;
}

export type AnswerProps =
  | McqMrqAnswerProps
  | ProgrammingAnswerProps
  | TextAnswerProps
  | FileUploadAnswerProps
  | ScribingAnswerProps
  | VoiceResponseAnswerProps
  | ForumResponseAnswerProps;
