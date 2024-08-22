import { JobStatus, JobStatusResponse } from 'types/jobs';

import { QuestionType } from '../assessment/question';
import { ForumPostResponseFieldData } from '../assessment/submission/answer/forumPostResponse';
import {
  MultipleChoiceFieldData,
  MultipleResponseFieldData,
} from '../assessment/submission/answer/multipleResponse';
import {
  ProgrammingFieldData,
  TestCaseResult,
  TestCaseType,
} from '../assessment/submission/answer/programming';
import { ScribingFieldData } from '../assessment/submission/answer/scribing';
import {
  FileUploadFieldData,
  TextResponseFieldData,
} from '../assessment/submission/answer/textResponse';
import { VoiceResponseFieldData } from '../assessment/submission/answer/voiceResponse';

interface AnswerCommonDetails<T extends keyof typeof QuestionType> {
  id: number;
  grade: number;
  questionType: T;
}

export interface McqAnswerDetails
  extends AnswerCommonDetails<'MultipleChoice'> {
  fields: MultipleChoiceFieldData;
  explanation: {
    correct?: boolean | null;
    explanations?: string[];
  };
  latestAnswer?: McqAnswerDetails;
}

export interface MrqAnswerDetails
  extends AnswerCommonDetails<'MultipleResponse'> {
  fields: MultipleResponseFieldData;
  explanation: {
    correct?: boolean | null;
    explanations?: string[];
  };
  latestAnswer?: MrqAnswerDetails;
}

export interface AnnotationTopic {
  id: number;
  postIds: number[];
  line: string;
}

export interface Annotation {
  fileId: number;
  topics: AnnotationTopic[];
}

export interface TestCase {
  canReadTests: boolean;
  public_test?: TestCaseResult[];
  private_test?: TestCaseResult[];
  evaluation_test?: TestCaseResult[];
  stdout?: string;
  stderr?: string;
}

export interface CodaveriFeedback {
  jobId: string;
  jobStatus: keyof typeof JobStatus;
  jobUrl?: string;
  errorMessage?: string;
}

export interface ProgrammingAnswerDetails
  extends AnswerCommonDetails<'Programming'> {
  fields: ProgrammingFieldData;
  explanation: {
    correct?: boolean;
    explanation: string[];
    failureType: TestCaseType;
  };
  testCases: TestCase;
  attemptsLeft?: number;
  autograding?: JobStatusResponse & {
    path?: string;
  };
  codaveriFeedback?: CodaveriFeedback;
  latestAnswer?: ProgrammingAnswerDetails & {
    annotations: Annotation[];
  };
}

export interface TextResponseAnswerDetails
  extends AnswerCommonDetails<'TextResponse'> {
  fields: TextResponseFieldData;
  attachments: { id: string; name: string }[];
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
  latestAnswer?: TextResponseAnswerDetails;
}

export interface FileUploadAnswerDetails
  extends AnswerCommonDetails<'FileUpload'> {
  fields: FileUploadFieldData;
  attachments: { id: string; name: string }[];
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
  latestAnswer?: FileUploadAnswerDetails;
}

export interface ComprehensionAnswerDetails
  extends AnswerCommonDetails<'Comprehension'> {}

export interface ScribingAnswerDetails extends AnswerCommonDetails<'Scribing'> {
  fields: ScribingFieldData;
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
  scribing_answer: {
    image_url: string;
    user_id: number;
    answer_id: number;
    scribbles: { content: string; creator_name: string; creator_id: number }[];
  };
}

export interface VoiceResponseAnswerDetails
  extends AnswerCommonDetails<'VoiceResponse'> {
  fields: VoiceResponseFieldData;
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
}

export interface ForumPostResponseAnswerDetails
  extends AnswerCommonDetails<'ForumPostResponse'> {
  fields: ForumPostResponseFieldData;
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
}

export interface AnswerDetailsMap {
  MultipleChoice: McqAnswerDetails;
  MultipleResponse: MrqAnswerDetails;
  Programming: ProgrammingAnswerDetails;
  TextResponse: TextResponseAnswerDetails;
  FileUpload: FileUploadAnswerDetails;
  Comprehension: ComprehensionAnswerDetails;
  Scribing: ScribingAnswerDetails;
  VoiceResponse: VoiceResponseAnswerDetails;
  ForumPostResponse: ForumPostResponseAnswerDetails;
}
