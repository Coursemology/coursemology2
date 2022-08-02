import { Permissions } from 'types';
import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
} from './courseUsers';

export type ExperiencePointsRecordPermissions = Permissions<
  'canUpdate' | 'canDestroy'
>;

export interface ExperiencePointsRecordSettings {
  name: string;
  rowCount: number;
}

export interface ExperiencePointsRecordListData {
  id: number;
  updaterCourseUser: CourseUserBasicListData;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

export interface PointsReason {
  manuallyAwarded: boolean;
  text: string;
  link?: string;
}

/**
 * Data types for experience points record data used in frontend that are converted from
 * received backend data.
 */

export interface ExperiencePointsRecordMiniEntity {
  id: number;
  updaterCourseUser: CourseUserBasicMiniEntity;
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
  pointsAwarded: number;
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
