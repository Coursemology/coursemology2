import {
  ExperiencePointsFilterData,
  ExperiencePointsRecordListData,
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRecordSettings,
} from 'types/course/experiencePointsRecords';
import { EntityStore } from 'types/store';

export const SAVE_EXPERIENCE_POINTS_RECORD_LIST =
  'course/experience_points/SAVE_EXPERIENCE_POINTS_RECORD_LIST';
export const UPDATE_EXPERIENCE_POINTS_RECORD =
  'course/experience_points/UPDATE_EXPERIENCE_POINTS_RECORD';
export const DELETE_EXPERIENCE_POINTS_RECORD =
  'course/experience_points/DELETE_EXPERIENCE_POINTS_RECORD';

export interface SaveExperiencePointsRecordListAction {
  type: typeof SAVE_EXPERIENCE_POINTS_RECORD_LIST;
  rowCount: number;
  records: ExperiencePointsRecordListData[];
  filters?: ExperiencePointsFilterData;
  studentName?: string;
}

export interface UpdateExperiencePointsRecordAction {
  type: typeof UPDATE_EXPERIENCE_POINTS_RECORD;
  data: ExperiencePointsRecordListData;
}

export interface DeleteExperiencePointsRecordAction {
  type: typeof DELETE_EXPERIENCE_POINTS_RECORD;
  id: number;
}

export type ExperiencePointsActionType =
  | SaveExperiencePointsRecordListAction
  | UpdateExperiencePointsRecordAction
  | DeleteExperiencePointsRecordAction;

export interface ExperiencePointsState {
  records: EntityStore<ExperiencePointsRecordMiniEntity>;
  setting: ExperiencePointsRecordSettings;
}
