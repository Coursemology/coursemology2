import { Permissions } from 'types';

import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
} from './courseUsers';

export type AnnouncementPermissions = Permissions<'canCreate'>;

export type AnnouncementListDataPermissions = Permissions<
  'canEdit' | 'canDelete'
>;

export interface AnnouncementListData {
  id: number;
  title: string;
  content: string;
  startTime: string;
  markAsReadUrl: string;
}

export interface AnnouncementData extends AnnouncementListData {
  endTime: string;
  creator: CourseUserBasicListData;
  isUnread: boolean;
  isSticky: boolean;
  isCurrentlyActive: boolean;
  permissions: AnnouncementListDataPermissions;
}

export interface FetchAnnouncementsData {
  announcementTitle: string;
  announcements: AnnouncementData[];
  permissions: AnnouncementPermissions;
}

export interface AnnouncementMiniEntity {
  id: number;
  title: string;
  content: string;
  startTime: string;
  markAsReadUrl: string;
}

export interface AnnouncementEntity extends AnnouncementMiniEntity {
  endTime: string;
  creator: CourseUserBasicMiniEntity;
  isUnread: boolean;
  isSticky: boolean;
  isCurrentlyActive: boolean;
  permissions: AnnouncementListDataPermissions;
}

export interface AnnouncementFormData {
  id?: number;
  title: string;
  content: string;
  sticky: boolean;
  startAt: Date;
  endAt: Date;
}
