import { MessageFormatElement } from 'react-intl';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import { WorkflowState } from 'types/course/assessment/submission/submission';

import { Attachment } from './components/answers/types';
import { AnswerHistory, QuestionHistory } from './reducers/history/types';

type FeedbackLineState = 'pending' | 'resolved' | 'dismissed';

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

interface FeedbackLine {
  id: string;
  linenum: number;
  feedback: string;
  category: string;
  isVerified: boolean;
  state: FeedbackLineState;
}

export interface LiveFeedbackMessage {
  text: string[];
  sender: 'Student' | 'Codaveri';
  linenum: number;
  timestamp: string | null;
  isBold: boolean;
}

export interface LiveFeedback {
  isRequestingLiveFeedback: boolean;
  pendingFeedbackToken: string | null;
  answerId: number;
  feedbackFiles: Record<string, FeedbackLine[]>;
  liveFeedbackId: number;
  isDialogOpen: boolean;
  conversation: LiveFeedbackMessage[];
  suggestedReplies: {
    id: string;
    defaultMessage: string | MessageFormatElement[] | undefined;
  }[];
  focusedMessageIndex: number;
}

export interface LiveFeedbackState {
  feedbackByQuestion: Record<number, LiveFeedback>;
  feedbackUrl: string | null;
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
  isDraftAnswer: boolean;
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
