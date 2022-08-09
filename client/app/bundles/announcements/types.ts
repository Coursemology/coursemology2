import { EntityStore } from 'types/store';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementMiniEntity,
} from 'types/system/announcements';

// Action Names
export const SAVE_ANNOUNCEMENTS_LIST = 'system/admin/SAVE_ANNOUNCEMENTS_LIST';
export const SAVE_ANNOUNCEMENT = 'system/admin/SAVE_ANNOUNCEMENT';
export const DELETE_ANNOUNCEMENT = 'system/admin/DELETE_ANNOUNCEMENT';

// Action Types
export interface SaveAnnouncementsListAction {
  type: typeof SAVE_ANNOUNCEMENTS_LIST;
  announcements: AnnouncementListData[];
}

export interface SaveAnnouncementAction {
  type: typeof SAVE_ANNOUNCEMENT;
  announcement: AnnouncementData;
}

export interface DeleteAnnouncementAction {
  type: typeof DELETE_ANNOUNCEMENT;
  id: number;
}

export type GlobalActionType =
  | SaveAnnouncementsListAction
  | SaveAnnouncementAction
  | DeleteAnnouncementAction;

// State Types
export interface GlobalState {
  announcements: EntityStore<AnnouncementMiniEntity>;
}
