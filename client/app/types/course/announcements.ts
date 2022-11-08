import { Permissions } from 'types';

export type AnnouncementPermissions = Permissions<'canCreate'>;

export type AnnouncementListDataPermissions = Permissions<
  'canEdit' | 'canDelete'
>;

export interface AnnouncementListData {
  id: number;
  title: string;
  content: string; // HTML String
  startTime: string;
  endTime: string;

  // Either this exists
  courseUserId?: number;
  courseUserName?: string;
  // or this
  userId?: number;
  userName?: string;
  // ------------------

  isUnread: boolean;
  isSticky: boolean;
  isCurrentlyActive: boolean;
  permissions: AnnouncementListDataPermissions;
}

export interface AnnouncementData extends AnnouncementListData {}

export interface AnnouncementMiniEntity {
  id: number;
  title: string;
  content: string; // HTML String
  startTime: string;
  endTime: string;

  // Either this exists
  courseUserId?: number;
  courseUserName?: string;
  // or this
  userId?: number;
  userName?: string;
  // ------------------

  isUnread: boolean;
  isSticky: boolean;
  isCurrentlyActive: boolean;
  permissions: AnnouncementListDataPermissions;
}

export interface AnnouncementEntity extends AnnouncementMiniEntity {}
export interface AnnouncementFormData {
  id?: number;
  title: string;
  content: string;
  sticky: boolean;
  startAt: Date;
  endAt: Date;
}
