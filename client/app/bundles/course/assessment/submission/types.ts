import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import { WorkflowState } from 'types/course/assessment/submission/submission';

import { Attachment } from './components/answers/types';
import { AnswerHistory, QuestionHistory } from './reducers/history/types';

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
  gamified: boolean;
  isCodaveriEnabled: boolean;
  isKoditsuEnabled: boolean;
  liveFeedbackEnabled: boolean;
  passwordProtected: boolean;
  questionIds: number[];
  showEvaluation: boolean;
  showMcqAnswer: boolean;
  showMcqMrqSolution: boolean;
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
}

export interface SubmissionState {
  attemptedAt: Date;
  basePoints: number;
  bonusEndAt: Date;
  bonusPoints: number;
  canGrade: boolean;
  canUpdate: boolean;
  dueAt: Date;
  grade?: number;
  gradedAt?: Date;
  grader?: {
    id: number;
    name: string;
  };
  graderView: boolean;
  isCreator: boolean;
  isGrader: boolean;
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

export type HistoryAnswer = AnswerData & {
  createdAt: Date;
};

export interface HistoryQuestion {
  pastAnswersLoaded: boolean;
  isLoading: boolean;
  answerIds: number[];
  selected: number[];
  loaded: boolean;
}

export interface HistoryState {
  answers: Record<number, AnswerHistory>;
  questions: Record<number, QuestionHistory>;
}

export enum ChatSender {
  'student' = 0,
  'codaveri' = 1,
}

export interface ChatShape {
  sender: ChatSender;
  lineNumber: number | null;
  lineContent: string | null;
  message: string[];
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
}

export interface LiveFeedbackChatData {
  id: string | number;
  isLiveFeedbackChatOpen: boolean;
  isRequestingLiveFeedback: boolean;
  pendingFeedbackToken: string | null;
  liveFeedbackId: number | null;
  currentThreadId: string | null;
  isCurrentThreadExpired: boolean;
  chats: ChatShape[];
  answerFiles: AnswerFile[];
  suggestions: Suggestion[];
}
