/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { VideoData } from 'types/course/videos';
import { AppState } from 'types/store';

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

export function getVideoPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getVideoMetadata(state: AppState) {
  return getLocalState(state).metadata;
}
