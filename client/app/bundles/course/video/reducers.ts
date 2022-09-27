import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  VideoData,
  VideoListData,
  VideoMetadata,
  VideoPermissions,
  VideoTab,
} from 'types/course/videos';
import { VideosState } from './types';

const initialState: VideosState = {
  videoTabs: [],
  videos: [],
  metadata: {
    currentTabId: undefined,
    studentsCount: 0,
    isCurrentCourseUser: false,
    isStudent: false,
    timelineAlgorithm: undefined,
    showPersonalizedTimelineFeatures: false,
  },
  permissions: { canAnalyze: false, canManage: false },
};

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    saveVideoList: (
      state,
      action: PayloadAction<{
        videoTabs: VideoTab[];
        videos: VideoListData[] | VideoData[];
        metadata: VideoMetadata;
        permissions: VideoPermissions;
      }>,
    ) => {
      state.videoTabs = action.payload.videoTabs;
      state.videos = action.payload.videos;
      state.metadata = action.payload.metadata;
      state.permissions = action.payload.permissions;
    },
    saveVideo: (
      state,
      action: PayloadAction<{
        videoTabs: VideoTab[];
        video: VideoData;
        showPersonalizedTimelineFeatures: boolean;
      }>,
    ) => {
      state.videoTabs = action.payload.videoTabs;
      const videoData = action.payload.video;
      const index = state.videos.findIndex((g) => g.id === videoData.id);
      if (index !== -1) {
        state.videos[index] = videoData;
      } else {
        state.videos.push(videoData);
      }
      if (state.metadata) {
        state.metadata.showPersonalizedTimelineFeatures =
          action.payload.showPersonalizedTimelineFeatures;
      }
    },
    removeVideo: (state, action: PayloadAction<{ videoId: number }>) => {
      state.videos = state.videos.filter(
        (video) => video.id !== action.payload.videoId,
      );
    },
  },
});

export const { saveVideoList, saveVideo, removeVideo } = videoSlice.actions;

export default videoSlice.reducer;
