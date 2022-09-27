import {
  VideoData,
  VideoListData,
  VideoMetadata,
  VideoPermissions,
  VideoTab,
} from 'types/course/videos';

// State Types

export interface VideosState {
  videoTabs: VideoTab[];
  videos: VideoListData[] | VideoData[];
  metadata: VideoMetadata;
  permissions: VideoPermissions | null;
}
