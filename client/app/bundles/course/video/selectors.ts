/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { VideoData } from 'types/course/videos';

function getLocalState(state: AppState) {
  return state.videos;
}

export function getVideoTabs(state: AppState) {
  return getLocalState(state).videoTabs;
}

export function getAllVideos(state: AppState) {
  return getLocalState(state).videos;
}

export function getVideo(state: AppState, videoId: number) {
  return getAllVideos(state).filter(
    (video) => video.id === videoId,
  )[0] as VideoData;
}

export function getVideoTitle(state: AppState) {
  return getLocalState(state).videoTitle;
}

export function getVideoPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getVideoMetadata(state: AppState) {
  return getLocalState(state).metadata;
}
