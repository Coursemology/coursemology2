import { JobStatus, JobStatusResponse } from 'types/jobs';

import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

export interface ProgrammingContent {
  id: number;
  filename: string;
  content: string;
  highlightedContent: string | null;
}

export type TestCaseType = 'public_test' | 'private_test' | 'evaluation_test';

export interface TestCaseResult {
  identifier?: string;
  expression: string;
  expected: string;
  output?: string;
  passed: boolean;
}

// BE Data Type

export interface ProgrammingFieldData extends AnswerFieldBaseData {
  files_attributes: ProgrammingContent[];
}

export interface ProgrammingAnswerData extends AnswerBaseData {
  questionType: QuestionType.Programming;
  fields: ProgrammingFieldData;
  explanation: {
    correct?: boolean;
    explanation: string[];
    failureType: TestCaseType;
  };
  testCases: {
    canReadTests: boolean;
    public_test?: TestCaseResult[];
    private_test?: TestCaseResult[];
    evaluation_test?: TestCaseResult[];
    stdout?: string;
    stderr?: string;
  };
  attemptsLeft?: number;
  autograding?: JobStatusResponse & {
    path?: string;
  };
  codaveriFeedback?: {
    jobId: string;
    jobStatus: keyof typeof JobStatus;
    jobUrl?: string;
    errorMessage?: string;
  };
  latestAnswer?: ProgrammingAnswerData & {
    annotations: {
      fileId: number;
      topics: {
        id: number;
        postIds: number[];
        line: string;
      }[];
    };
  };
}

// FE Data Type

export interface ProgrammingFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.Programming;
  files_attributes: ProgrammingContent[];
  import_files: ProgrammingContent[] | null;
}
