import { defineMessages } from 'react-intl';

export default defineMessages({
  courseSettings: {
    id: 'course.admin.CourseSettings.courseSettings',
    defaultMessage: 'Course settings',
  },
  courseName: {
    id: 'course.admin.CourseSettings.courseName',
    defaultMessage: 'Course name',
  },
  courseNamePlaceholder: {
    id: 'course.admin.CourseSettings.courseNamePlaceholder',
    defaultMessage: 'e.g., Maths Universe, Geovengers',
  },
  courseDescription: {
    id: 'course.admin.CourseSettings.courseDescription',
    defaultMessage: 'Course description',
  },
  courseDescriptionPlaceholder: {
    id: 'course.admin.CourseSettings.courseDescriptionPlaceholder',
    defaultMessage:
      'e.g., Darth Vader is taking over the universe. We need you to save the day!',
  },
  courseLogo: {
    id: 'course.admin.CourseSettings.courseLogo',
    defaultMessage: 'Course logo',
  },
  courseLogoUpdated: {
    id: 'course.admin.CourseSettings.courseLogoUpdated',
    defaultMessage: 'The new course logo was successfully uploaded.',
  },
  publicity: {
    id: 'course.admin.CourseSettings.publicity',
    defaultMessage: 'Publicity',
  },
  published: {
    id: 'course.admin.CourseSettings.published',
    defaultMessage: 'Published',
  },
  publishedDescription: {
    id: 'course.admin.CourseSettings.publishedDescription',
    defaultMessage:
      "This course will appear and be searchable in Coursemology's public courses page.",
  },
  allowUsersToSendEnrolmentRequests: {
    id: 'course.admin.CourseSettings.allowUsersToSendEnrolmentRequests',
    defaultMessage: 'Allow users to send enrolment requests',
  },
  courseDelivery: {
    id: 'course.admin.CourseSettings.courseDelivery',
    defaultMessage: 'Course delivery',
  },
  startsAt: {
    id: 'course.admin.CourseSettings.startsAt',
    defaultMessage: 'Starts as',
  },
  endsAt: {
    id: 'course.admin.CourseSettings.endsAt',
    defaultMessage: 'Ends at',
  },
  timeZone: {
    id: 'course.admin.CourseSettings.timeZone',
    defaultMessage: 'Time zone',
  },
  uploadANewImage: {
    id: 'course.admin.CourseSettings.uploadANewImage',
    defaultMessage: 'Choose a new image',
  },
  uploadingLogo: {
    id: 'course.admin.CourseSettings.uploadingLogo',
    defaultMessage: 'Uploading your new logo...',
  },
  clearChanges: {
    id: 'course.admin.CourseSettings.clearChanges',
    defaultMessage: 'Clear changes',
  },
  imageFormatsInfo: {
    id: 'course.admin.CourseSettings.imageFormatsInfo',
    defaultMessage: 'JPG, JPEG, GIF, and PNG files only.',
  },
  gamified: {
    id: 'course.admin.CourseSettings.gamified',
    defaultMessage: 'Gamified',
  },
  gamifiedDescription: {
    id: 'course.admin.CourseSettings.gamifiedDescription',
    defaultMessage:
      "One of Coursemology's top features! If enabled, this course becomes gamified. You may award experience points (EXPs) and configure achievements, levels, and leaderboards.",
  },
  enablePersonalisedTimelines: {
    id: 'course.admin.CourseSettings.enablePersonalisedTimelines',
    defaultMessage: 'Enable personalised timelines',
  },
  personalisedTimelinesDescription: {
    id: 'course.admin.CourseSettings.personalisedTimelinesDescription',
    defaultMessage:
      "If enabled, you can change each student's personalised timelines and the default timeline algorithm below.",
  },
  defaultTimelineAlgorithm: {
    id: 'course.admin.CourseSettings.defaultTimelineAlgorithm',
    defaultMessage: 'Default timeline algorithm',
  },
  fixed: {
    id: 'course.admin.CourseSettings.fixed',
    defaultMessage: 'Fixed',
  },
  fomo: {
    id: 'course.admin.CourseSettings.fomo',
    defaultMessage: 'FOMO (Fear of Missing Out)',
  },
  stragglers: {
    id: 'course.admin.CourseSettings.stragglers',
    defaultMessage: 'Stragglers',
  },
  otot: {
    id: 'course.admin.CourseSettings.otot',
    defaultMessage: 'OTOT (Own Time, Own Target)',
  },
  fixedDescription: {
    id: 'course.admin.CourseSettings.fixedDescription',
    defaultMessage:
      'Assessments will open and close according to their default opening and closing reference times.',
  },
  fomoDescription: {
    id: 'course.admin.CourseSettings.fomoDescription',
    defaultMessage:
      'Subsequent opening reference timings will be brought forward if students complete their assessments early.',
  },
  stragglersDescription: {
    id: 'course.admin.CourseSettings.stragglersDescription',
    defaultMessage:
      'Leave no one behind; subsequent closing reference timings will be pushed back if students complete their assessments late.',
  },
  ototDescription: {
    id: 'course.admin.CourseSettings.ototDescription',
    defaultMessage:
      'Both opening and closing reference timings can be adjusted based on FOMO and Stragglers rules.',
  },
  earlyPreview: {
    id: 'course.admin.CourseSettings.earlyPreview',
    defaultMessage: 'Early preview',
  },
  earlyPreviewDescription: {
    id: 'course.admin.CourseSettings.earlyPreviewDescription',
    defaultMessage:
      'Allow students to attempt assessments that start at a future time if they have fulfilled the unlock conditions.',
  },
  daysInAdvance: {
    id: 'course.admin.CourseSettings.daysInAdvance',
    defaultMessage: 'Days in advance',
  },
  deleteCourse: {
    id: 'course.admin.CourseSettings.deleteCourse',
    defaultMessage: 'Delete course',
  },
  deleteCourseWarning: {
    id: 'course.admin.CourseSettings.deleteCourseWarning',
    defaultMessage:
      'Once you delete this course, you will NOT be able to access it anymore. All data associated with this course will be permanently deleted as well.',
  },
  deleteThisCourse: {
    id: 'course.admin.CourseSettings.deleteThisCourse',
    defaultMessage: 'Delete this course',
  },
  timeSettings: {
    id: 'course.admin.CourseSettings.timeSettings',
    defaultMessage: 'Time settings',
  },
  titleRequired: {
    id: 'course.admin.CourseSettings.titleRequired',
    defaultMessage: 'Course name is required.',
  },
  startTimeRequired: {
    id: 'course.admin.CourseSettings.startTimeRequired',
    defaultMessage: 'Start time is required.',
  },
  endMustAfterStartTime: {
    id: 'course.admin.CourseSettings.endMustAfterStartTime',
    defaultMessage: 'End time must be before starting time.',
  },
  invalidTimeFormat: {
    id: 'course.admin.CourseSettings.invalidTimeFormat',
    defaultMessage: 'Invalid Date and/or Time',
  },
  deleteCoursePromptAction: {
    id: 'course.admin.CourseSettingst.deleteCoursePromptAction',
    defaultMessage: 'Delete course',
  },
  deleteCoursePromptTitle: {
    id: 'course.admin.CourseSettingst.deleteCoursePromptTitle',
    defaultMessage: "Really, really sure you're deleting {title}?",
  },
  deleteCourseSuccess: {
    id: 'course.admin.CourseSettingst.deleteCourseSuccess',
    defaultMessage:
      'This course has been deleted. Redirecting you to courses page...',
  },
  pleaseTypeChallengeToConfirmDelete: {
    id: 'course.admin.CourseSettingst.pleaseTypeChallengeToConfirmDelete',
    defaultMessage: 'Please type {challenge} to confirm deletion.',
  },
  confirmDeletePlaceholder: {
    id: 'course.admin.CourseSettingst.confirmDeletePlaceholder',
    defaultMessage: 'This is your last chance to go back!',
  },
  errorOccurredWhenDeletingCourse: {
    id: 'course.admin.CourseSettingst.errorOccurredWhenDeletingCourse',
    defaultMessage: 'An error occurred while deleting this course.',
  },
});
