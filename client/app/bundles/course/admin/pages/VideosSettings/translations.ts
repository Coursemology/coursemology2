import { defineMessages } from 'react-intl';

export default defineMessages({
  videosSettings: {
    id: 'course.admin.videos.videosSettings',
    defaultMessage: 'Videos settings',
  },
  videosTabs: {
    id: 'course.admin.videos.videosTabs',
    defaultMessage: 'Tabs',
  },
  addATab: {
    id: 'course.admin.videos.addATab',
    defaultMessage: 'Add a tab',
  },
  newVideosTabDefaultTitle: {
    id: 'course.admin.videos.newVideosTabDefaultTitle',
    defaultMessage: 'New Videos Tab',
  },
  videosTabsSubtitle: {
    id: 'course.admin.videos.videosTabsSubtitle',
    defaultMessage: 'Drag and drop the video tabs to rearrange.',
  },
  deleteTabPromptAction: {
    id: 'course.admin.videos.deleteTabPromptAction',
    defaultMessage: 'Delete {title} tab',
  },
  deleteTabPromptTitle: {
    id: 'course.admin.videos.deleteTabPromptTitle',
    defaultMessage: 'Delete {title} tab?',
  },
  deleteTabPromptMessage: {
    id: 'course.admin.videos.deleteTabPromptMessage',
    defaultMessage:
      'Deleting this tab will delete all its associated videos and statistics. This action is irreversible.',
  },
});
