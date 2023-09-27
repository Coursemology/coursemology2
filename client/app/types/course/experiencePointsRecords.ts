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

export interface AllExperiencePointsRecords {
  rowCount: number;
  experiencePointRecords: AllExperiencePointsRecordListData[];
}

export interface PointsReason {
  isManuallyAwarded: boolean;
  text: string;
  link: string;
}

export interface ExperiencePointsRecordListData {
  id: number;
  updater: CourseUserBasicListData;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

export interface AllExperiencePointsRecordListData
  extends ExperiencePointsRecordListData {
  courseUserName: string;
  userExperienceUrl?: string;
}

/**
 * Data types for experience points record data used in frontend that are converted from
 * received backend data.
 */

export interface ExperiencePointsRecordMiniEntity {
  id: number;
  updater: CourseUserBasicMiniEntity;
  reason: PointsReason;
  pointsAwarded: number;
  updatedAt: Date;
  permissions: ExperiencePointsRecordPermissions;
}

export interface AllExperiencePointsRecordMiniEntity
  extends ExperiencePointsRecordMiniEntity {
  courseUserName: string;
  userExperienceUrl?: string;
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
