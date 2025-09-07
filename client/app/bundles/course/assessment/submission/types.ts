import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { AnswerBaseData } from 'types/course/assessment/submission/answer/answer';
import { ForumPostResponseAnswerData } from 'types/course/assessment/submission/answer/forumPostResponse';
import {
  MultipleChoiceAnswerData,
  MultipleResponseAnswerData,
} from 'types/course/assessment/submission/answer/multipleResponse';
import { ProgrammingAnswerData } from 'types/course/assessment/submission/answer/programming';
import { RubricBasedResponseAnswerData } from 'types/course/assessment/submission/answer/rubricBasedResponse';
import { ScribingAnswerData } from 'types/course/assessment/submission/answer/scribing';
import {
  FileUploadAnswerData,
  TextResponseAnswerData,
} from 'types/course/assessment/submission/answer/textResponse';
import { VoiceResponseAnswerData } from 'types/course/assessment/submission/answer/voiceResponse';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import { WorkflowState } from 'types/course/assessment/submission/submission';

import { Attachment } from './components/answers/types';

type TestCaseTypes = 'public_test' | 'private_test' | 'evaluation_test';

type JobStatus = 'submitted' | 'completed' | 'errored';

export interface AssessmentState {
  allowPartialSubmission: boolean;
  autograded: boolean;
  categoryId: number;
  delayedGradePublication: boolean;
  description: string;
  files: {
    name: string;
    url: string;
  }[];
  id: number;
  gamified: boolean;
  isCodaveriEnabled: boolean;
  isKoditsuEnabled: boolean;
  liveFeedbackEnabled: boolean;
  passwordProtected: boolean;
  questionIds: number[];
  showEvaluation: boolean;
  showMcqAnswer: boolean;
  showMcqMrqSolution: boolean;
  showRubricToStudents: boolean;
  showPrivate: boolean;
  skippable: boolean;
  tabId: number;
  tabbedView: boolean;
  timeLimit?: number;
  title: string;
}

export type AttachmentsState = Record<number, Attachment[]>;

export type QuestionsState = Record<
  number,
  SubmissionQuestionData<keyof typeof QuestionType>
>;

export interface AnswerState {
  initial: Record<number, AnswerData>;
  clientVersionByAnswerId: Record<number, number>;
  categoryGrades: Record<number, CategoryGradeType[]>;
}

export interface CategoryGradeType {
  id: number;
  gradeId: number | null;
  categoryId: number;
  grade: number | null;
  explanation: string | null;
}

export interface SubmissionState {
  attemptedAt: Date;
  basePoints: number;
  bonusEndAt: Date;
  bonusPoints: number;
  canGrade: boolean;
  canUpdate: boolean;
  dueAt: Date;
  getHelpCounts?: {
    questionId: number;
    messageCount: number;
  }[];
  grade?: number;
  gradedAt?: Date;
  grader?: {
    id: number;
    name: string;
  };
  graderView: boolean;
  isCreator: boolean;
  isGrader: boolean;
  isStudent: boolean;
  late: boolean;
  maxStep?: number;
  maximumGrade: number;
  pointsAwarded: number;
  showPublicTestCasesOutput: boolean;
  showStdoutAndStderr: boolean;
  submitter: {
    id: number;
    name: string;
  };
  id: number;
  submittedAt: Date;
  workflowState: WorkflowState;
}

export interface Explanation {
  correct: boolean;
  explanations: string[];
  failureType: TestCaseTypes;
}

export interface SubmissionFlagsState {
  isAutograding: boolean;
  isDeleting: boolean;
  isDownloadingCsv: boolean;
  isDownloadingFiles: boolean;
  isForceSubmitting: boolean;
  isLoading: boolean;
  isPublishing: boolean;
  isReminding: boolean;
  isSaving: boolean;
  isStatisticsDownloading: boolean;
  isSubmissionBlocked: boolean;
  isUnsubmitting: boolean;
}

export interface QuestionFlag {
  isAutograding: boolean;
  isResetting: boolean;
  jobUrl: string | null;
  jobError: boolean;
  jobErrorMessage?: string;
}

interface CodaveriFeedback {
  jobId: number;
  jobStatus: JobStatus;
  jobUrl?: string;
  errorMessage?: string;
}

export interface CodaveriFeedbackStatus {
  answers: Record<number, CodaveriFeedback>;
}

export interface GradeWithPrefilledStatus {
  id: number; // answerId
  originalGrade: number;
  grade: number;
  prefilled: boolean;
}

export interface GradingState {
  questions: Record<number, GradeWithPrefilledStatus>;
  exp: number;
  basePoints: number;
  maximumGrade: number;
  expMultiplier: number;
}

interface Topic {
  postIds: number[];
}

export type TopicState = Record<number, Topic>;

export interface AnswerDetailsMap {
  MultipleChoice: MultipleChoiceAnswerData;
  MultipleResponse: MultipleResponseAnswerData;
  Programming: ProgrammingAnswerData;
  TextResponse: TextResponseAnswerData;
  FileUpload: FileUploadAnswerData;
  Comprehension: AnswerBaseData;
  Scribing: ScribingAnswerData;
  VoiceResponse: VoiceResponseAnswerData;
  ForumPostResponse: ForumPostResponseAnswerData;
  RubricBasedResponse: RubricBasedResponseAnswerData;
}

export interface AnswerDetailsProps<T extends keyof typeof QuestionType> {
  question: SubmissionQuestionData<T>;
  answer: AnswerDetailsMap[T];
}

export type AnswerDataWithQuestion<T extends keyof typeof QuestionType> =
  AnswerDetailsMap[T] & { question: SubmissionQuestionData<T> };

export interface HistoryViewData {
  open: boolean;
  questionId: number;
  questionNumber: number;
}

export enum ChatSender {
  'student' = 0,
  'codaveri' = 1,
}

export interface ChatShape {
  sender: ChatSender;
  filename?: string;
  message: string;
  createdAt: string;
  isError: boolean;
}

export interface FeedbackShape {
  path: string;
  annotations: FeedbackLine[];
}

export interface FeedbackLine {
  id: string;
  line: number;
  content: string;
}

export interface AnswerFile {
  filename: string;
  content: string;
}

export interface Suggestion {
  id: string;
  defaultMessage: string;
  index: number;
}

export interface LiveFeedbackChatData {
  id: string | number;
  isLiveFeedbackChatOpen: boolean;
  isLiveFeedbackChatLoaded: boolean;
  isRequestingLiveFeedback: boolean;
  pendingFeedbackToken: string | null;
  liveFeedbackId: number | null;
  currentThreadId: string | null;
  isCurrentThreadExpired: boolean;
  chats: ChatShape[];
  answerFiles: AnswerFile[];
  suggestions: Suggestion[];
}

export interface LiveFeedbackLocalStorage {
  isLiveFeedbackChatOpen: boolean;
  isRequestingLiveFeedback: boolean;
  pendingFeedbackToken: string | null;
  feedbackUrl: string | null;
}

export interface LiveFeedbackThread {
  id: number;
  answerId: number;
  threadId: string;
  creatorId: number;
  messages: LiveFeedbackMessage[];
}

export interface LiveFeedbackMessage {
  content: string;
  isError: boolean;
  creatorId: number;
  createdAt: string;
}
