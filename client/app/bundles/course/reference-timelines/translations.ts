import { defineMessages } from 'react-intl';

export default defineMessages({
  timelineDesigner: {
    id: 'course.timelines.timelineDesigner',
    defaultMessage: 'Timeline Designer',
  },
  addTimeline: {
    id: 'course.timelines.addTimeline',
    defaultMessage: 'Timeline',
  },
  errorUpdatingTime: {
    id: 'course.timelines.errorUpdatingTime',
    defaultMessage: 'An error occurred while updating this time.',
  },
  errorCreatingTimeline: {
    id: 'course.timelines.errorCreatingTimeline',
    defaultMessage: 'An error occurred while creating timeline: {newTitle}.',
  },
  errorRenamingTimeline: {
    id: 'course.timelines.errorRenamingTimeline',
    defaultMessage: 'An error occurred while renaming timeline: {newTitle}.',
  },
  confirmCreateTimeline: {
    id: 'course.timelines.confirmCreateTimeline',
    defaultMessage: 'Create Timeline',
  },
  confirmRenameTimeline: {
    id: 'course.timelines.confirmRenameTimeline',
    defaultMessage: 'Rename Timeline',
  },
  timelineTitle: {
    id: 'course.timelines.timelineTitle',
    defaultMessage: 'Timeline title',
  },
  renameTimelineTitle: {
    id: 'course.timelines.renameTimelineTitle',
    defaultMessage: 'Rename {title}',
  },
  newTimeline: {
    id: 'course.timelines.newTimeline',
    defaultMessage: 'New Timeline',
  },
  mustValidTimelineTitle: {
    id: 'course.timelines.mustValidTimelineTitle',
    defaultMessage: 'You must specify a valid title for a timeline.',
  },
  canChangeTitleLater: {
    id: 'course.timelines.canChangeTitleLater',
    defaultMessage: 'You can change this title again later.',
  },
  hintCanAddCustomTimes: {
    id: 'course.timelines.hintCanAddCustomTimes',
    defaultMessage:
      'Once you create this timeline, you can add times in this timeline that override those in the Default Timeline for some items.',
  },
  hintAssignedStudentsSeeCustomTimes: {
    id: 'course.timelines.hintAssignedStudentsSeeCustomTimes',
    defaultMessage:
      'For these items, students assigned to this timeline will see these overridden times.',
  },
  hintAssignedStudentsSeeDefaultTimes: {
    id: 'course.timelines.hintAssignedStudentsSeeDefaultTimes',
    defaultMessage:
      "For items that are not overridden in this timeline, they will see the items' corresponding times in the Default Timeline.",
  },
  confirmRevertAndDeleteTimeline: {
    id: 'course.timelines.confirmRevertAndDeleteTimeline',
    defaultMessage: 'Revert and delete timeline and its times',
  },
  confirmDeleteTimeline: {
    id: 'course.timelines.confirmDeleteTimeline',
    defaultMessage: 'Delete timeline and its times',
  },
  sureDeletingTimeline: {
    id: 'course.timelines.sureDeletingTimeline',
    defaultMessage: "Sure you're deleting {title}?",
  },
  timelineHasNTimes: {
    id: 'course.timelines.timelineHasNTimes',
    defaultMessage:
      'This timeline assigns custom times in {n, plural, =1 {# item} other {# items}}.',
  },
  timelineHasNStudents: {
    id: 'course.timelines.timelineHasNStudents',
    defaultMessage:
      'There are {n, plural, =1 {# student} other {# students}} assigned to this timeline.',
  },
  hintDeletingTimelineWillRemoveTimes: {
    id: 'course.timelines.hintDeletingTimelineWillRemoveTimes',
    defaultMessage: 'Deleting this timeline will remove all its custom times.',
  },
  hintDeletingTimelineWillNotAffectSubmissions: {
    id: 'course.timelines.hintDeletingTimelineWillNotAffectSubmissions',
    defaultMessage:
      "Rest assured, there will be no changes to students' submissions data, though this action cannot be undone.",
  },
  hintChooseAlternativeTimeline: {
    id: 'course.timelines.hintChooseAlternativeTimeline',
    defaultMessage: 'Please choose a timeline to revert the students to.',
  },
  searchItems: {
    id: 'course.timelines.searchItems',
    defaultMessage: 'Search items',
  },
  saving: {
    id: 'course.timelines.saving',
    defaultMessage: 'Saving...',
  },
  lastSaved: {
    id: 'course.timelines.lastSaved',
    defaultMessage: 'Last saved {at}',
  },
  unchangedSince: {
    id: 'course.timelines.unchangedSince',
    defaultMessage: 'Unchanged since {time}',
  },
  saved: {
    id: 'course.timelines.saved',
    defaultMessage: 'Saved',
  },
  error: {
    id: 'course.timelines.error',
    defaultMessage: 'Oops!',
  },
  clickToAssignTime: {
    id: 'course.timelines.clickToAssignTime',
    defaultMessage: 'Click to assign a time here',
  },
  hintNoTimeAssigned: {
    id: 'course.timelines.hintNoTimeAssigned',
    defaultMessage:
      'No custom time assigned. Students assigned to this timeline will follow the time in the Default Timeline.',
  },
  errorDeletingTimeline: {
    id: 'course.timelines.errorDeletingTimeline',
    defaultMessage: 'An error occurred while deleting timeline: {title}.',
  },
  errorDeletingTime: {
    id: 'course.timelines.errorDeletingTime',
    defaultMessage: 'An error occurred while deleting this time.',
  },
  errorCreatingTime: {
    id: 'course.timelines.errorCreatingTime',
    defaultMessage: 'An error occurred while creating this time.',
  },
  nAssigned: {
    id: 'course.timelines.nAssigned',
    defaultMessage: '{n} custom times',
  },
  deleteTimeline: {
    id: 'course.timelines.deleteTimeline',
    defaultMessage: 'Delete',
  },
  renameTimeline: {
    id: 'course.timelines.renameTimeline',
    defaultMessage: 'Rename',
  },
  defaultTimeline: {
    id: 'course.timelines.defaultTimeline',
    defaultMessage: 'Default Timeline',
  },
  deleteTime: {
    id: 'course.timelines.deleteTime',
    defaultMessage: 'Delete time',
  },
  assigningToItem: {
    id: 'course.timelines.assigningToItem',
    defaultMessage: 'Assigning to item',
  },
  assignedToItem: {
    id: 'course.timelines.assignedToItem',
    defaultMessage: 'Assigned to item',
  },
  assignedInTimeline: {
    id: 'course.timelines.assignedInTimeline',
    defaultMessage: 'Assigned in timeline',
  },
  assigningInTimeline: {
    id: 'course.timelines.assigningInTimeline',
    defaultMessage: 'Assigning in timeline',
  },
  startsAt: {
    id: 'course.timelines.startsAt',
    defaultMessage: 'Starts at',
  },
  bonusEndsAt: {
    id: 'course.timelines.bonusEndsAt',
    defaultMessage: 'Bonus ends at',
  },
  endsAt: {
    id: 'course.timelines.endsAt',
    defaultMessage: 'Ends at',
  },
  mustValidDateTimeFormat: {
    id: 'course.timelines.mustValidDateTimeFormat',
    defaultMessage: 'Please provide a valid date and time format.',
  },
  mustSpecifyStartTime: {
    id: 'course.timelines.mustSpecifyStartTime',
    defaultMessage: 'You must specify a start time.',
  },
  endTimeMustAfterStart: {
    id: 'course.timelines.endTimeMustAfterStart',
    defaultMessage: 'End time must be after the start time.',
  },
  bonusEndTimeMustAfterStart: {
    id: 'course.timelines.bonusEndTimeMustAfterStart',
    defaultMessage: 'Bonus end time must be after the start time.',
  },
  today: {
    id: 'course.timelines.today',
    defaultMessage: 'Today',
  },
});
