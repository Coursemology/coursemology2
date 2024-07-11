import {
  VideoData,
  VideoListData,
  VideoMetadata,
  VideoPermissions,
  VideoTab,
} from 'types/course/videos';

// State Types

export interface VideosState {
  videoTitle: string;
  videoTabs: VideoTab[];
  videos: VideoListData[] | VideoData[];
  metadata: VideoMetadata;
  permissions: VideoPermissions | null;
}
