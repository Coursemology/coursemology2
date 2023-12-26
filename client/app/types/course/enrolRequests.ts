import { CourseUserRoles } from './courseUsers';
import { TimelineAlgorithm } from './personalTimes';

export interface EnrolRequestMiniEntity {
  id: number;
  name: string;
  email: string;
  status: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  role?: CourseUserRoles;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
}

export interface EnrolRequestListData {
  id: number;
  name: string;
  email: string;
  status: string;
  phantom: boolean;
  role?: CourseUserRoles;
  timelineAlgorithm?: TimelineAlgorithm;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
}

/**
 * Data types for PATCH approve enrol requests via /enrol_requests
 */ export interface ApproveEnrolRequestPatchData {
  course_user: {
    name: string;
    phantom: boolean;
    role?: CourseUserRoles;
    timeline_algorithm?: TimelineAlgorithm;
  };
}

/**
 * Row data from EnrolRequestsTable Datatable
 */
export interface EnrolRequestRowData extends EnrolRequestMiniEntity {
  'S/N'?: number;
  actions?: undefined;
}
