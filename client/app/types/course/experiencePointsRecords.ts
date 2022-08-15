import { Permissions } from 'types';
import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
} from './courseUsers';

export type ExperiencePointsRecordPermissions = Permissions<
  'canUpdate' | 'canDestroy'
>;

export interface ExperiencePointsRecordSettings {
  courseUserName: string;
  rowCount: number;
}

export interface PointsReason {
  isManuallyAwarded: boolean;
  text: string;
  link: string;
}

export interface ExperiencePointsRecordUserListData
  extends CourseUserBasicListData {
  isCourseUser: boolean;
}

export interface ExperiencePointsRecordListData {
  id: number;
  updaterUser: ExperiencePointsRecordUserListData;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

/**
 * Data types for experience points record data used in frontend that are converted from
 * received backend data.
 */

export interface ExperiencePointsRecordUserMiniEntity
  extends CourseUserBasicMiniEntity {
  isCourseUser: boolean;
}

export interface ExperiencePointsRecordMiniEntity {
  id: number;
  updaterUser: ExperiencePointsRecordUserMiniEntity;
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
