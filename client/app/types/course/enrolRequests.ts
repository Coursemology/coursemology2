import { TimelineAlgorithm } from './personalTimes';

export interface EnrolRequestEntity {
  id: number;
  name: string;
  email: string;
  status: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  role?: string;
  createdAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface EnrolRequestData {
  id: number;
  name: string;
  email: string;
  status: string;
  phantom: boolean;
  role?: string;
  timelineAlgorithm?: TimelineAlgorithm;
  createdAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

/**
 * Data types for PATCH approve enrol requests via /enrol_requests
 */ export interface ApproveEnrolRequestPatchData {
  course_user: {
    name: string;
    phantom: boolean;
    role?: string;
    timeline_algorithm?: TimelineAlgorithm;
  };
}
