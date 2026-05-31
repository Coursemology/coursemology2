import { QuestionType } from '../../question';
import { TextResponseSolutionType } from '../question/types';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

export interface TextResponseFieldData extends AnswerFieldBaseData {
  answer_text: string;
}

export interface TextResponseSolutionResult {
  id: number;
  grade?: number;
  maximumGrade: number;
  solution: string;
  solutionType: TextResponseSolutionType;
  tests?: {
    identifier: string;
    output?: string;
    expected?: string;
    correct: boolean;
    outputError?: string;
    expectedError?: string;
  }[];
}

export interface TextResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.TextResponse;
  fields: TextResponseFieldData;
  attachments: { id: string; name: string }[];
  explanation?: {
    correct: boolean | null;
    explanations: string[];
  };
  latestAnswer?: TextResponseAnswerData;
  solutionResults?: TextResponseSolutionResult[];
}

export interface FileUploadFieldData extends AnswerFieldBaseData {}

export interface FileUploadAnswerData extends AnswerBaseData {
  questionType: QuestionType.FileUpload;
  fields: FileUploadFieldData;
  attachments: { id: string; name: string }[];
  explanation?: {
    correct: boolean | null;
    explanations: string[];
  };
  latestAnswer?: FileUploadAnswerData;
}

// FE Data Type

export interface TextResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.TextResponse;
  answer_text: string;
  files: File[] | null;
}

export interface FileUploadFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.FileUpload;
  files: File[] | null;
}

// API Data Type

export interface TextResponseAttachmentPostData {
  answer: {
    id: number;
    files: File[];
    clientVersion: number;
  };
}

export interface TextResponseAttachmentDeleteData {
  attachment_id: number;
}
