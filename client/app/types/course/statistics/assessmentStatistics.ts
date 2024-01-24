interface Assessment {
  id: number | string;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  url: string;
}

interface SubmissionInfo {
  courseUser: StudentInfo;
  totalGrade?: number | null;
}

export interface SubmissionWithTimeInfo extends SubmissionInfo {
  submittedAt: string;
  endAt: string;
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
  id: number | string;
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

export interface AssessmentMarksPerQuestionStats {
  maximumGrade: number;
  questionCount: number;
  assessmentTitle: string;
  submissions: SubmissionMarksPerQuestionStats[];
}
