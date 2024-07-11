import {
  AnnouncementData,
  AnnouncementEntity,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_ANNOUNCEMENT_LIST =
  'course/announcement/SAVE_ANNOUNCEMENT_LIST';
export const SAVE_ANNOUNCEMENT = 'course/announcement/SAVE_ANNOUNCEMENT';
export const DELETE_ANNOUNCEMENT = 'course/announcement/DELETE_ANNOUNCEMENT';

// Action Types
export interface SaveAnnouncementListAction {
  type: typeof SAVE_ANNOUNCEMENT_LIST;
  announcementTitle: string;
  announcementList: AnnouncementData[];
  announcementPermissions: AnnouncementPermissions;
}

export interface SaveAnnouncementAction {
  type: typeof SAVE_ANNOUNCEMENT;
  announcement: AnnouncementData;
}
export interface DeleteAnnouncementAction {
  type: typeof DELETE_ANNOUNCEMENT;
  id: number;
}

export type AnnouncementsActionType =
  | SaveAnnouncementListAction
  | SaveAnnouncementAction
  | DeleteAnnouncementAction;

// State Types
export interface AnnouncementsState {
  announcementTitle: string;
  announcements: EntityStore<AnnouncementEntity>;
  permissions: AnnouncementPermissions;
}
