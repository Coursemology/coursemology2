interface Assessment {
  id: number;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  questionCount?: number;
  url: string;
}

interface SubmissionInfo {
  courseUser: StudentInfo;
  totalGrade?: number | null;
}

export interface SubmissionWithTimeInfo extends SubmissionInfo {
  submittedAt: Date;
  endAt: Date;
  dayDifference?: number;
}

interface UserInfo {
  id: number | string;
  name: string;
}

interface StudentInfo extends UserInfo {
  role: 'student';
  isPhantom: boolean;
}

export interface AssessmentStatistics {
  assessment: Assessment;
  submissions: SubmissionWithTimeInfo[];
  allStudents: StudentInfo[];
}

export interface AssessmentAncestor {
  id: number;
  title: string;
  courseTitle: string;
}

export interface AssessmentAncestors {
  assessments: AssessmentAncestor[];
}

export interface AnswerGradeStats {
  id: number;
  grade: number;
  maximumGrade: number;
}

export interface SubmissionMarksPerQuestionStats extends SubmissionInfo {
  grader?: UserInfo;
  groups?: { name: string }[];
  workflowState?: string;
  answers?: AnswerGradeStats[];
}

export interface SubmissionDetailsStats extends SubmissionWithTimeInfo {
  submissionExists: boolean;
  grader?: UserInfo;
  groups?: { name: string }[];
  workflowState?: string;
  answers?: AnswerGradeStats[];
}

export interface AssessmentMarksPerQuestionStats {
  questionCount: number;
  submissions: SubmissionMarksPerQuestionStats[];
}

export interface AssessmentStatisticsStats {
  assessment: Assessment | null;
  allStudents: StudentInfo[];
  submissions: SubmissionDetailsStats[];
  ancestors: AssessmentAncestor[];
}

export interface AssessmentStatisticsStore extends AssessmentStatisticsStats {
  isLoading: boolean;
}
