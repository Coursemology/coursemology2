import CourseAPI from 'api/course';
import { VideoFormData } from 'types/course/videos';
import { Operation } from 'types/store';
import { saveVideoList, saveVideo, removeVideo } from './reducers';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { video :
 *     { title, tab_id, description, url, start_at, published, has_personal_times }
 *   }
 */
const formatAttributes = (data: VideoFormData): FormData => {
  const payload = new FormData();

  [
    'title',
    'tab',
    'description',
    'url',
    'startAt',
    'published',
    'hasPersonalTimes',
  ].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'tab':
          payload.append('video[tab_id]', `${data[field]}`);
          break;
        case 'startAt':
          payload.append('video[start_at]', data[field].toString());
          break;
        case 'hasPersonalTimes':
          payload.append('video[has_personal_times]', `${data[field]}`);
          break;
        default:
          payload.append(`video[${field}]`, data[field]);
          break;
      }
    }
  });

  return payload;
};

export function fetchVideos(currentTabId?: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.video.videos
      .index(currentTabId)
      .then((response) => {
        const data = response.data;
        dispatch(saveVideoList(data));
      })
      .catch((error) => {
        throw error;
      });
}

export function loadVideo(videoId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.video.videos.fetch(videoId).then((response) => {
      dispatch(saveVideo(response.data));
    });
}

export function createVideo(data: VideoFormData): Operation<void> {
  const attributes = formatAttributes(data);
  return async (dispatch) =>
    CourseAPI.video.videos.create(attributes).then((response) => {
      dispatch(saveVideo(response.data));
    });
}

export function updateVideo(
  videoId: number,
  data: VideoFormData,
): Operation<void> {
  const attributes = formatAttributes(data);
  return async (dispatch) =>
    CourseAPI.video.videos.update(videoId, attributes).then((response) => {
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
  data: boolean,
): Operation<void> {
  const attributes = { video: { published: data } };
  return async (dispatch) =>
    CourseAPI.video.videos.update(videoId, attributes).then((response) => {
      dispatch(saveVideo(response.data));
    });
}
