interface Assessment {
  id: number;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  questionCount?: number;
  url: string;
}

interface UserInfo {
  id: number;
  name: string;
}

interface StudentInfo extends UserInfo {
  role: 'student';
  isPhantom: boolean;
}

interface AnswerStats {
  id: number;
  grade: number;
  maximumGrade: number;
}

export interface SubmissionInfo {
  courseUser: StudentInfo;
  totalGrade?: number | null;
  submittedAt: Date;
  endAt: Date;
  dayDifference?: number;
}

export interface SubmissionDetailsStats extends SubmissionInfo {
  submissionExists: boolean;
  grader?: UserInfo;
  groups?: { name: string }[];
  workflowState?: string;
  answers?: AnswerStats[];
}

export interface AssessmentStatistics {
  assessment: Assessment;
  submissions: SubmissionInfo[];
  allStudents: StudentInfo[];
}

export interface AncestorInfo {
  id: number;
  title: string;
  courseTitle: string;
}

export interface AssessmentStatisticsStats {
  assessment: Assessment | null;
  allStudents: StudentInfo[];
  submissions: SubmissionDetailsStats[];
  ancestors: AncestorInfo[];
}

export interface AssessmentStatisticsStore extends AssessmentStatisticsStats {
  isLoading: boolean;
}
