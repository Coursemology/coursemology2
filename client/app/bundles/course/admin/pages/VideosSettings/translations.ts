import { defineMessages } from 'react-intl';

export default defineMessages({
  videosSettings: {
    id: 'course.admin.VideosSettings.videosSettings',
    defaultMessage: 'Videos settings',
  },
  videosTabs: {
    id: 'course.admin.VideosSettings.videosTabs',
    defaultMessage: 'Tabs',
  },
  addATab: {
    id: 'course.admin.VideosSettings.addATab',
    defaultMessage: 'Add a tab',
  },
  newVideosTabDefaultTitle: {
    id: 'course.admin.VideosSettings.newVideosTabDefaultTitle',
    defaultMessage: 'New Videos Tab',
  },
  videosTabsSubtitle: {
    id: 'course.admin.VideosSettings.videosTabsSubtitle',
    defaultMessage: 'Drag and drop the video tabs to rearrange.',
  },
  deleteTabPromptAction: {
    id: 'course.admin.VideosSettings.deleteTabPromptAction',
    defaultMessage: 'Delete {title} tab',
  },
  deleteTabPromptTitle: {
    id: 'course.admin.VideosSettings.deleteTabPromptTitle',
    defaultMessage: 'Delete {title} tab?',
  },
  deleteTabPromptMessage: {
    id: 'course.admin.VideosSettings.deleteTabPromptMessage',
    defaultMessage:
      'Deleting this tab will delete all its associated videos and statistics. This action is irreversible.',
  },
  errorOccurredWhenCreatingTab: {
    id: 'course.admin.VideosSettings.errorOccurredWhenCreatingTab',
    defaultMessage: 'An error occurred while creating a tab.',
  },
  errorOccurredWhenDeletingTab: {
    id: 'course.admin.VideosSettings.errorOccurredWhenDeletingTab',
    defaultMessage: 'An error occurred while deleting the tab.',
  },
});
