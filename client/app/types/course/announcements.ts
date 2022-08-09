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
  type?: string;
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
  type?: string;
}

export interface AnnouncementEntity extends AnnouncementMiniEntity {}
export interface AnnouncementFormData {
  title: string;
  content: string;
  sticky: boolean;
  startAt: string;
  endAt: string;
  type?: string;
}

export interface AnnouncementEditFormData extends AnnouncementFormData {
  id: number;
}
