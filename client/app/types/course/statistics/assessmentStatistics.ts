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

export interface AssessmentStatistis {
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
