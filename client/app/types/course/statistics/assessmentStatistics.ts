import { CourseUserRoles } from '../courseUsers';

interface Assessment {
  id: number | string;
  title: string;
  startAt: string | null;
  endAt: string | null;
  maximumGrade: number;
  url: string;
}

interface Submission {
  courseUser: {
    id: number | string;
    name: string;
    role: CourseUserRoles;
    isPhantom: boolean;
  };
  submittedAt: string;
  endAt: string;
  grade: number;
}

interface Student {
  id: number | string;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
}

export interface AssessmentStatistics {
  assessment: Assessment;
  submissions: Submission[];
  allStudents: Student[];
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

export interface SubmissionStats {
  id: number;
  name: string;
  role: string;
  isPhantom: boolean;
  grader?: string;
  graderId?: number;
  groups?: { name: string }[];
  groupCategoryId?: number;
  totalGrade?: number | null;
  workflowState?: string;
  answers?: AnswerGradeStats[];
}

export interface AssessmentMarksPerQuestionStats {
  maximumGrade: number;
  questionCount: number;
  submissions: SubmissionStats[];
}
