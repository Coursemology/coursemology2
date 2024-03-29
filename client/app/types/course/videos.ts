import { Permissions } from 'types';

import { TimelineAlgorithm } from './personalTimes';

export interface VideoMetadata {
  currentTabId?: number;
  studentsCount: number;
  isCurrentCourseUser: boolean;
  isStudent: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  showPersonalizedTimelineFeatures: boolean;
}

export type VideoPermissions = Permissions<'canAnalyze' | 'canManage'>;

export type VideoListDataPermissions = Permissions<'canAttempt' | 'canManage'>;

/**
 * Data types for video data retrieved from backend through API call.
 */

export interface VideoTab {
  id: number;
  title: string;
}

export interface Video {
  id: number;
  tabId: number;
  title: string;
  url: string;
  description: string;
}

export interface VideoListData extends Video {
  published: boolean;
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
  startTimeInfo: {
    isFixed: boolean;
    effectiveTime?: string;
    referenceTime?: string;
  };
  videoSubmissionId: number | null;
  hasTodo?: boolean;
  videoChildrenExist?: boolean;
  watchCount?: number;
  percentWatched: number;
  permissions: VideoListDataPermissions;
}

export interface VideoData extends VideoListData {
  videoStatistics: {
    video: { videoUrl: string };
    statistics: object;
  };
}

/**
 * Data types for video form data.
 */

export interface VideoFormData {
  id?: number;
  title: string;
  tab: number;
  description: string;
  url: string;
  startAt: Date;
  published: boolean;
  hasPersonalTimes: boolean;
  hasTodo: boolean;
}

export interface VideoPostData {
  video: {
    title: VideoFormData['title'];
    tab_id: VideoFormData['tab'];
    description: VideoFormData['description'];
    url: VideoFormData['url'];
    start_at: VideoFormData['startAt'];
    published: VideoFormData['published'];
    has_personal_times: VideoFormData['hasPersonalTimes'];
    has_todo: VideoFormData['hasTodo'];
  };
}

export interface VideoPatchData {
  video: {
    id: VideoFormData['id'];
    title: VideoFormData['title'];
    tab_id: VideoFormData['tab'];
    description: VideoFormData['description'];
    url: VideoFormData['url'];
    start_at: VideoFormData['startAt'];
    published: VideoFormData['published'];
    has_personal_times: VideoFormData['hasPersonalTimes'];
    has_todo: VideoFormData['hasTodo'];
  };
}

export interface VideoPatchPublishData {
  video: {
    id: VideoFormData['id'];
    published: VideoFormData['published'];
  };
}
