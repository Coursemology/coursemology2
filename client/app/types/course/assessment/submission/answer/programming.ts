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
  highlightedContent?: string | null;
}

export type TestCaseType = 'public_test' | 'private_test' | 'evaluation_test';

/**
 * A test case definition. Belongs to the question, and is the same for every grading run that was
 * made against that version of the question.
 */
export interface TestCaseData {
  id: number;
  /** Only sent when the viewer may read tests. */
  identifier?: string;
  expression: string;
  expected: string;
}

/**
 * The outcome of running one test case in one grading run. `id` is the id of the test case it is
 * for, which is how it joins back to the corresponding {@link TestCaseData}.
 */
export interface TestCaseResultData {
  id: number;
  /** Only sent when the viewer may read this test case type's outputs. */
  output?: string;
  passed: boolean;
}

export type TestCasesByType = Partial<Record<TestCaseType, TestCaseData[]>>;

/** Keyed by test case id within each type. */
export type TestResultsByType = Partial<
  Record<TestCaseType, Record<number, TestCaseResultData>>
>;

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

/**
 * Everything the test case panel needs for one answer: the definitions, the results of the grading
 * run they were graded by (absent when the answer has not been graded), and that run's streams.
 */
export interface TestCasesState {
  canReadTests: boolean;
  testCases: TestCasesByType;
  testResults?: TestResultsByType;
  stdout?: string;
  stderr?: string;
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

export interface ProgrammingAnswerData extends AnswerBaseData {
  questionType: QuestionType.Programming;
  fields: ProgrammingFieldData;
  explanation?: {
    correct?: boolean;
    explanation: string[];
    failureType: TestCaseType;
  };
  canReadTests: boolean;
  testCases: TestCasesByType;
  testResults?: TestResultsByType;
  stdout?: string;
  stderr?: string;
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
  annotations?: Annotation[];
  posts?: Post[];
}

// FE Data Type

export interface ProgrammingFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.Programming;
  files_attributes: ProgrammingContent[];
  import_files: ProgrammingContent[] | null;
}
