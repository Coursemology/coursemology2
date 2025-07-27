import { JobStatus, JobStatusResponse } from 'types/jobs';
import { UserBasicListData } from 'types/users';

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

export interface Annotation {
  fileId: number;
  topics: {
    id: number;
    postIds: number[];
    line: string;
  }[];
}

export interface Post {
  id: number;
  topicId: number;
  title: string;
  text: string;
  creator: UserBasicListData;
  createdAt: string;
  canUpdate: boolean;
  canDestroy: boolean;
  isDelayed: boolean;
  codaveriFeedback: CodaveriFeedback;
}

export interface CodaveriFeedback {
  jobId: string;
  jobStatus: keyof typeof JobStatus;
  jobUrl?: string;
  errorMessage?: string;
}

// BE Data Type

export interface ProgrammingFieldData extends AnswerFieldBaseData {
  files_attributes: ProgrammingContent[];
}

export interface ProgrammingTestCaseData {
  id: number;
  identifier?: string;
  expression: string;
  expected: string;
}

export interface ProgrammingTestResultData {
  id: number;
  output?: string;
  passed: boolean;
}

export interface ProgrammingAutoGradingData {
  id: number;
  createdAt: string;
  job: JobStatusResponse & {
    path?: string;
  };
  testCases?: {
    public_test?: ProgrammingTestCaseData[];
    private_test?: ProgrammingTestCaseData[];
    evaluation_test?: ProgrammingTestCaseData[];
  };
  testResults?: {
    public_test?: Record<string, ProgrammingTestResultData>;
    private_test?: Record<string, ProgrammingTestResultData>;
    evaluation_test?: Record<string, ProgrammingTestResultData>;
  };

  stdout?: string;
  stderr?: string;
  gradedOnPastSnapshot: boolean;
}

export interface ProgrammingAnswerData extends AnswerBaseData {
  questionType: QuestionType.Programming;
  fields: ProgrammingFieldData;
  explanation: {
    correct?: boolean;
    explanation: string[];
    failureType: TestCaseType;
  };
  canReadTests?: boolean;
  autoGradingCount: number;
  autogradings?: ProgrammingAutoGradingData[];
  attemptsLeft?: number;
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
  annotations?: Annotation[];
  posts?: Post[];
  testCases?: {
    public_test?: ProgrammingTestCaseData[];
    private_test?: ProgrammingTestCaseData[];
    evaluation_test?: ProgrammingTestCaseData[];
  };
}

// FE Data Type

export interface ProgrammingFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.Programming;
  files_attributes: ProgrammingContent[];
  import_files: ProgrammingContent[] | null;
}
