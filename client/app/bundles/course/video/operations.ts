import { VideoFormData } from 'types/course/videos';
import { Operation } from 'types/store';

import CourseAPI from 'api/course';

import { removeVideo, saveVideo, saveVideoList } from './reducers';

export function fetchVideos(currentTabId?: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.video.videos.index(currentTabId).then((response) => {
      const data = response.data;
      dispatch(saveVideoList(data));
    });
}

export function loadVideo(videoId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.video.videos.fetch(videoId).then((response) => {
      dispatch(saveVideo(response.data));
    });
}

export function createVideo(data: VideoFormData): Operation<void> {
  const videoPostData = {
    video: {
      title: data.title,
      tab_id: data.tab,
      description: data.description,
      url: data.url,
      start_at: data.startAt,
      published: data.published,
      has_personal_times: data.hasPersonalTimes,
      has_todo: data.hasTodo,
    },
  };
  return async (dispatch) =>
    CourseAPI.video.videos.create(videoPostData).then((response) => {
      dispatch(saveVideo(response.data));
    });
}

export function updateVideo(
  videoId: number,
  data: VideoFormData,
): Operation<void> {
  const videoPatchData = {
    video: {
      id: data.id,
      title: data.title,
      tab_id: data.tab,
      description: data.description,
      url: data.url,
      start_at: data.startAt,
      published: data.published,
      has_personal_times: data.hasPersonalTimes,
      has_todo: data.hasTodo,
    },
  };
  return async (dispatch) =>
    CourseAPI.video.videos.update(videoId, videoPatchData).then((response) => {
      dispatch(saveVideo(response.data));
    });
}

export function deleteVideo(videoId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.video.videos.delete(videoId).then(() => {
      dispatch(removeVideo({ videoId }));
    });
}

export function updatePublishedVideo(
  videoId: number,
  isPublished: boolean,
): Operation<void> {
  const videoPatchPublishData = {
    video: { id: videoId, published: isPublished },
  };
  return async (dispatch) =>
    CourseAPI.video.videos
      .update(videoId, videoPatchPublishData)
      .then((response) => {
        dispatch(saveVideo(response.data));
      });
}
