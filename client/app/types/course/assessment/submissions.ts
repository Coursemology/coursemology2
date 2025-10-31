import { Permissions } from 'types';

export type SubmissionPermissions = Permissions<
  'canManage' | 'isTeachingStaff'
>;

export type SubmissionListDataPermissions = Permissions<
  'canSeeGrades' | 'canGrade'
>;

export type SubmissionStatus =
  | 'attempting'
  | 'submitted'
  | 'graded'
  | 'published';

export interface SubmissionsTabData {
  // Depends on whether user canManage (i.e. can access the pending submissions tab)
  myStudentsPendingCount?: number;
  allStudentsPendingCount?: number;
  // -------------------------------------------------------------------------------
  categories: { id: number; title: string }[];
}

export interface SubmissionAssessmentFilterData {
  id: number;
  title: string;
}
export interface SubmissionGroupFilterData {
  id: number;
  name: string;
}
export interface SubmissionUserFilterData {
  id: number;
  name: string;
}

export interface SubmissionFilterData {
  assessments: SubmissionAssessmentFilterData[];
  groups: SubmissionGroupFilterData[];
  users: SubmissionUserFilterData[];
}

export interface SubmissionsMetaData {
  isGamified: boolean;
  submissionCount: number;
  tabs: SubmissionsTabData;
  filter: SubmissionFilterData;
}

export interface SubmissionListData {
  id: number;
  courseUserId: number;
  courseUserName: string;

  assessmentId: number;
  assessmentTitle: string;
  submittedAt: string;
  status: SubmissionStatus;

  teachingStaff?: { teachingStaffId: number; teachingStaffName: string }[];

  currentGrade?: string;
  isGradedNotPublished?: boolean;
  pointsAwarded?: number;
  maxGrade: string;

  permissions: SubmissionListDataPermissions;
}

export interface SubmissionMiniEntity {
  id: number;

  courseUserId: number;
  courseUserName: string;

  assessmentId: number;
  assessmentTitle: string;
  assessmentPublished: boolean;
  submittedAt: string;
  status: SubmissionStatus;

  teachingStaff?: { teachingStaffId: number; teachingStaffName: string }[];

  currentGrade?: string;
  isGradedNotPublished?: boolean;
  pointsAwarded?: number;
  maxGrade: string;

  permissions: SubmissionListDataPermissions;
}
