import { JobStatus } from 'types/jobs';
import { UserBasicListData } from 'types/users';

import { QuestionType } from '../assessment/question';
import { ForumPostResponseFieldData } from '../assessment/submission/answer/forumPostResponse';
import {
  MultipleChoiceFieldData,
  MultipleResponseFieldData,
} from '../assessment/submission/answer/multipleResponse';
import {
  ProgrammingFieldData,
  TestCaseResult,
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

export interface TestCase {
  questionId?: number;
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
  // Tests might not be present (e.g. no autograding)
  testCases: TestCase[];
  codaveriFeedback?: CodaveriFeedback;
  annotations: Annotation[];
  posts: Post[];
}
export interface ProcessedProgrammingAnswerDetails
  extends AnswerCommonDetails<'Programming'> {
  fields: ProgrammingFieldData;
  testCases: TestCase;
  codaveriFeedback?: CodaveriFeedback;
  annotations: Annotation[];
  posts: Post[];
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

// Currently, only ProgrammingAnswerDetails is processed
export interface ProcessedAnswerDetailsMap {
  MultipleChoice: McqAnswerDetails;
  MultipleResponse: MrqAnswerDetails;
  Programming: ProcessedProgrammingAnswerDetails;
  TextResponse: TextResponseAnswerDetails;
  FileUpload: FileUploadAnswerDetails;
  Comprehension: ComprehensionAnswerDetails;
  Scribing: ScribingAnswerDetails;
  VoiceResponse: VoiceResponseAnswerDetails;
  ForumPostResponse: ForumPostResponseAnswerDetails;
}
