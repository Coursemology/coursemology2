import { WorkflowState } from '../assessment/submission/submission';

interface AssessmentInfo {
  id: number;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  url: string;
}

interface MainAssessmentInfo extends AssessmentInfo {
  questionCount: number;
}

interface AncestorAssessmentInfo extends AssessmentInfo {}

interface UserInfo {
  id: number;
  name: string;
}

export interface StudentInfo extends UserInfo {
  isPhantom: boolean;
  role: 'student';
}

interface AnswerInfo {
  id: number;
  grade: number;
  maximumGrade: number;
}

interface SubmissionInfo {
  courseUser: StudentInfo;
  workflowState?: WorkflowState;
  submittedAt?: string;
  endAt?: string;
  totalGrade?: number | null;
}

export interface MainSubmissionInfo extends SubmissionInfo {
  answers?: AnswerInfo[];
  grader?: UserInfo;
  groups: { name: string }[];
  submissionExists: boolean;
}

export interface AncestorSubmissionInfo extends SubmissionInfo {
  workflowState: WorkflowState;
  submittedAt: string;
  endAt: string;
  totalGrade: number | null;
}

export interface AncestorInfo {
  id: number;
  title: string;
  courseTitle: string;
}

export interface MainAssessmentStats {
  assessment: MainAssessmentInfo | null;
  submissions: MainSubmissionInfo[];
  allStudents: StudentInfo[];
  ancestors: AncestorInfo[];
}

export interface AncestorAssessmentStats {
  assessment: AncestorAssessmentInfo;
  submissions: AncestorSubmissionInfo[];
  allStudents: StudentInfo[];
}

export interface AssessmentStatisticsStore extends MainAssessmentStats {
  isLoading: boolean;
}
