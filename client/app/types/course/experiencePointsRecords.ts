import { Permissions } from 'types';

import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
} from './courseUsers';

export type ExperiencePointsRecordPermissions = Permissions<
  'canUpdate' | 'canDestroy'
>;

export interface ExperiencePointsRecords {
  rowCount: number;
  records: ExperiencePointsRecordListData[];
  filters: ExperiencePointsFilterData;
}

export interface ExperiencePointsRecordsForUser {
  rowCount: number;
  records: ExperiencePointsRecordListData[];
  studentName: string;
}

export interface PointsReason {
  isManuallyAwarded: boolean;
  text: string;
  link: string;
  maxExp?: number;
}

export interface ExperiencePointsRecordListData {
  id: number;
  student: CourseUserBasicListData;
  updater: CourseUserBasicListData;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

/**
 * Data types for experience points record data used in frontend that are converted from
 * received backend data.
 */
export interface ExperiencePointsRecordMiniEntity {
  id: number;
  student: CourseUserBasicMiniEntity;
  updater: CourseUserBasicMiniEntity;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

/**
 * Data types for experience points data.
 */

export interface ExperiencePointsRowData {
  id: number;
  reason: string;
  pointsAwarded: number | string;
}

/**
 * Data types for PATCH experience points via /update
 */
export interface UpdateExperiencePointsRecordPatchData {
  experience_points_record: {
    reason: string;
    points_awarded: number;
  };
}

/**
 * Data types for filtering the experience points record
 */
export interface ExperiencePointsNameFilterData {
  id: number;
  name: string;
}

export interface ExperiencePointsFilterData {
  courseStudents: ExperiencePointsNameFilterData[];
}
