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

export interface SubmissionFilterData {
  assessments: { id: number; title: string }[];
  groups: { id: number; name: string }[];
  users: { id: number; name: string }[];
}

export interface SubmissionListData {
  id: number;
  courseUserId: number;
  courseUserName: string;

  assessmentId: number;
  assessmentTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  // Depends on whether the tab is a pending assesments tab ---
  teachingStaff?: { teachingStaffId: number; teachingStaffName: string }[];
  // ----------------------------------------------------------

  // Depends on canSeeGrades ------------
  currentGrade?: string;
  isGradedNotPublished?: boolean;
  // Depends on isGamified---
  pointsAwarded?: number;
  // ------------------------
  // ------------------------------------
  maxGrade: string;

  permissions: SubmissionListDataPermissions;
}

export interface SubmissionData extends SubmissionListData {}

export interface SubmissionMiniEntity {
  id: number;

  courseUserId: number;
  courseUserName: string;

  assessmentId: number;
  assessmentTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  // Depends on whether the tab is a pending assesments tab ---
  teachingStaff?: { teachingStaffId: number; teachingStaffName: string }[];
  // ----------------------------------------------------------

  // Depends on canSeeGrades ------------
  currentGrade?: string;
  isGradedNotPublished?: boolean;
  // Depends on isGamified---
  pointsAwarded?: number;
  // ------------------------
  // ------------------------------------
  maxGrade: string;

  permissions: SubmissionListDataPermissions;
}

export interface SubmissionEntity extends SubmissionMiniEntity {}
