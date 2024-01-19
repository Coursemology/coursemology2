import { WorkflowState } from 'types/course/assessment/submission/submission';
import { CourseUserRoles } from 'types/course/courseUsers';

export interface CourseUserShape {
  id: number;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
}

export interface SubmissionRecordShape {
  courseUser: CourseUserShape;
  workflowState: WorkflowState;
  submittedAt: string;
  endAt: string;
  grade: number;
  dayDifference: number;
}

export interface AncestorShape {
  id: number;
  title: string;
  courseTitle: string;
}
