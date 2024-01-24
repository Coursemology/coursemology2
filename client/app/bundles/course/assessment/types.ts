import { WorkflowState } from 'types/course/assessment/submission/submission';
import { CourseUserRoles } from 'types/course/courseUsers';
import { SubmissionWithTimeInfo } from 'types/course/statistics/assessmentStatistics';

export interface CourseUserShape {
  id: number;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
}

export interface SubmissionRecordShape extends SubmissionWithTimeInfo {
  workflowState: WorkflowState;
  dayDifference: number;
}

export interface AncestorShape {
  id: number;
  title: string;
  courseTitle: string;
}
