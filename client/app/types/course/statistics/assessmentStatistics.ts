import { QuestionType } from '../assessment/question';
import { SpecificQuestionDataMap } from '../assessment/submission/question/types';
import { WorkflowState } from '../assessment/submission/submission';
import { CourseUserBasicListData } from '../courseUsers';

import { AnswerDetailsMap } from './answer';

interface AssessmentInfo {
  id: number;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  url: string;
}

interface MainAssessmentInfo extends AssessmentInfo {
  isAutograded: boolean;
  questionCount: number;
  questionIds: number[];
  liveFeedbackEnabled: boolean;
}

interface AncestorAssessmentInfo extends AssessmentInfo {}

interface UserInfo {
  id: number;
  name: string;
}

export interface StudentInfo extends UserInfo {
  isPhantom: boolean;
  role: 'student';
  email?: string;
}

export interface AnswerInfo {
  lastAttemptAnswerId: number;
  grade: number;
  maximumGrade: number;
}

export interface AttemptInfo {
  lastAttemptAnswerId: number;
  isAutograded: boolean;
  attemptCount: number;
  correct: boolean | null;
}

interface SubmissionInfo {
  id: number;
  courseUser: StudentInfo;
  workflowState?: WorkflowState;
  submittedAt?: string;
  endAt?: string;
  totalGrade?: number | null;
}

export interface MainSubmissionInfo extends SubmissionInfo {
  attemptStatus?: AttemptInfo[];
  answers?: AnswerInfo[];
  grader?: UserInfo;
  groups: { name: string }[];
}

export interface AncestorSubmissionInfo extends SubmissionInfo {
  workflowState: WorkflowState;
  submittedAt?: string;
  endAt?: string;
  totalGrade?: number | null;
}

export interface AncestorInfo {
  id: number;
  title: string;
  courseTitle: string;
}

export interface MainAssessmentStats {
  assessment: MainAssessmentInfo | null;
  submissions: MainSubmissionInfo[];
  ancestors: AncestorInfo[];
}

export interface AncestorAssessmentStats {
  assessment: AncestorAssessmentInfo;
  submissions: AncestorSubmissionInfo[];
}

export interface AssessmentStatisticsState extends MainAssessmentStats {}

interface QuestionBasicDetails<T extends keyof typeof QuestionType> {
  id: number;
  title: string;
  description: string;
  type: T;
  questionNumber?: number;
  maximumGrade: number;
}

export interface CommentItem {
  id: number;
  createdAt: Date;
  creator: CourseUserBasicListData;
  isDelayed: boolean;
  text: string;
}

export interface AllAnswerItem {
  id: number;
  createdAt: Date;
  currentAnswer: boolean;
  workflowState: WorkflowState;
}

export interface SubmissionQuestionDetails {
  allAnswers: AllAnswerItem[];
  comments: CommentItem[];
}

export type QuestionDetails<T extends keyof typeof QuestionType> =
  QuestionBasicDetails<T> & SpecificQuestionDataMap[T];

export type AnswerStatisticsData<T extends keyof typeof QuestionType> =
  AnswerDetailsMap[T] & {
    createdAt: Date;
    question: QuestionDetails<T>;
  };

export interface QuestionAnswerDisplayDetails<
  T extends keyof typeof QuestionType,
> {
  question: QuestionDetails<T>;
  answer: AnswerDetailsMap[T];
}

export interface AssessmentLiveFeedbackStatistics {
  courseUser: StudentInfo;
  groups: { name: string }[];
  workflowState?: WorkflowState;
  submissionId?: number;
  liveFeedbackCount?: number[]; // Will already be ordered by question
  totalFeedbackCount?: number;
  questionIds: number[];
}
