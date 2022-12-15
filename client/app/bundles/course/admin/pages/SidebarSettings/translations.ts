import { defineMessages } from 'react-intl';

export default defineMessages({
  sidebarSettings: {
    id: 'course.admin.SidebarSettings.sidebarSettings',
    defaultMessage: "Student's sidebar ordering",
  },
  sidebarSettingsSubtitle: {
    id: 'course.admin.SidebarSettings.sidebarSettingsSubtitle',
    defaultMessage: 'Drag and drop the sidebar items to rearrange.',
  },
  sidebarSettingsUpdated: {
    id: 'course.admin.SidebarSettings.sidebarSettingsUpdated',
    defaultMessage:
      'The new sidebar ordering has been applied. Refresh to see the latest changes.',
  },
  errorOccurredWhenUpdatingSidebar: {
    id: 'course.admin.SidebarSettings.errorOccurredWhenUpdatingSidebar',
    defaultMessage: 'An error occurred while updating the sidebar ordering.',
  },
});
