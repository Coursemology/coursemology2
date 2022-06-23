import { Permissions } from 'types';

export type AnnouncementListDataPermissions = Permissions<
  'canEdit' | 'canDelete'
>;

export interface AnnouncementListData {
  id: number;
  title: string;
  content: string; // HTML String
  startTime: string;

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

export interface AnnouncementMiniEntity {
  id: number;
  title: string;
  content: string; // HTML String
  startTime: string;

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
