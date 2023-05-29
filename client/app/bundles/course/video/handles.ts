import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const getVideoTitle = async (videoId: number): Promise<string> => {
  const { data } = await CourseAPI.video.videos.fetch(videoId);

  return data.video.title;
};

const getTabTitle = async (
  courseUrl: string,
  tabId?: number,
): Promise<CrumbPath> => {
  const { data } = await CourseAPI.video.videos.index(tabId);

  const defaultTabId = data.videoTabs[0].id;
  const currentTabId = data.metadata.currentTabId;

  return {
    activePath: `${courseUrl}/videos?tab=${defaultTabId}`,
    content: {
      title: data.videoTabs.find((tab) => tab.id === currentTabId)?.title,
      url: `videos?tab=${currentTabId}`,
    },
  };
};

const getTabTitleFromVideoId = async (
  courseUrl: string,
  videoId: number,
): Promise<CrumbPath> => {
  const { data } = await CourseAPI.video.videos.fetch(videoId);

  const defaultTabId = data.videoTabs[0].id;
  const currentTabId = data.video.tabId;

  return {
    activePath: `${courseUrl}/videos?tab=${defaultTabId}`,
    content: {
      title: data.videoTabs.find((tab) => tab.id === currentTabId)?.title,
      url: `videos?tab=${currentTabId}`,
    },
  };
};

export const videosHandle: DataHandle = (match, location) => {
  const videoId = getIdFromUnknown(match.params?.videoId);
  const courseUrl = `/courses/${match.params.courseId}`;

  let promise: Promise<CrumbPath> | Promise<string>;

  if (videoId) {
    promise = getTabTitleFromVideoId(courseUrl, videoId);
  } else {
    const searchParams = new URLSearchParams(location.search);
    const tabId = getIdFromUnknown(searchParams.get('tab'));

    promise = getTabTitle(courseUrl, tabId);
  }

  return { shouldRevalidate: true, getData: () => promise };
};

export const videoHandle: DataHandle = (match) => {
  const videoId = getIdFromUnknown(match.params?.videoId);
  if (!videoId) throw new Error(`Invalid video id: ${videoId}`);

  return { getData: () => getVideoTitle(videoId) };
};
