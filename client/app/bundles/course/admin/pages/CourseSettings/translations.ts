import { defineMessages } from 'react-intl';

export default defineMessages({
  courseSettings: {
    id: 'course.admin.course.courseSettings',
    defaultMessage: 'Course settings',
  },
  courseName: {
    id: 'course.admin.course.courseName',
    defaultMessage: 'Course name',
  },
  courseNamePlaceholder: {
    id: 'course.admin.course.courseNamePlaceholder',
    defaultMessage: 'e.g., Maths Universe, Geovengers',
  },
  courseDescription: {
    id: 'course.admin.course.courseDescription',
    defaultMessage: 'Course description',
  },
  courseDescriptionPlaceholder: {
    id: 'course.admin.course.courseDescriptionPlaceholder',
    defaultMessage:
      'e.g., Darth Vader is taking over the universe. We need you to save the day!',
  },
  courseLogo: {
    id: 'course.admin.course.courseLogo',
    defaultMessage: 'Course logo',
  },
  courseLogoUpdated: {
    id: 'course.admin.course.courseLogoUpdated',
    defaultMessage: 'The new course logo was successfully uploaded.',
  },
  publicity: {
    id: 'course.admin.course.publicity',
    defaultMessage: 'Publicity',
  },
  published: {
    id: 'course.admin.course.published',
    defaultMessage: 'Published',
  },
  publishedDescription: {
    id: 'course.admin.course.publishedDescription',
    defaultMessage:
      "This course will appear and be searchable in Coursemology's public courses page.",
  },
  allowUsersToSendEnrolmentRequests: {
    id: 'course.admin.course.allowUsersToSendEnrolmentRequests',
    defaultMessage: 'Allow users to send enrolment requests',
  },
  courseDelivery: {
    id: 'course.admin.course.courseDelivery',
    defaultMessage: 'Course delivery',
  },
  startsAt: {
    id: 'course.admin.course.startsAt',
    defaultMessage: 'Starts as',
  },
  endsAt: {
    id: 'course.admin.course.endsAt',
    defaultMessage: 'Ends at',
  },
  timeZone: {
    id: 'course.admin.course.timeZone',
    defaultMessage: 'Time zone',
  },
  uploadANewImage: {
    id: 'course.admin.course.uploadANewImage',
    defaultMessage: 'Choose a new image',
  },
  uploadingLogo: {
    id: 'course.admin.course.uploadingLogo',
    defaultMessage: 'Uploading your new logo...',
  },
  clearChanges: {
    id: 'course.admin.course.clearChanges',
    defaultMessage: 'Clear changes',
  },
  imageFormatsInfo: {
    id: 'course.admin.course.imageFormatsInfo',
    defaultMessage: 'JPG, JPEG, GIF, and PNG files only.',
  },
  gamified: {
    id: 'course.admin.course.gamified',
    defaultMessage: 'Gamified',
  },
  gamifiedDescription: {
    id: 'course.admin.course.gamifiedDescription',
    defaultMessage:
      "One of Coursemology's top features! If enabled, this course becomes gamified. You may award experience points (EXPs) and configure achievements, levels, and leaderboards.",
  },
  enablePersonalisedTimelines: {
    id: 'course.admin.course.enablePersonalisedTimelines',
    defaultMessage: 'Enable personalised timelines',
  },
  personalisedTimelinesDescription: {
    id: 'course.admin.course.personalisedTimelinesDescription',
    defaultMessage:
      "If enabled, you can change each student's personalised timelines and the default timeline algorithm below.",
  },
  defaultTimelineAlgorithm: {
    id: 'course.admin.course.defaultTimelineAlgorithm',
    defaultMessage: 'Default timeline algorithm',
  },
  fixed: {
    id: 'course.admin.course.fixed',
    defaultMessage: 'Fixed',
  },
  fomo: {
    id: 'course.admin.course.fomo',
    defaultMessage: 'FOMO (Fear of Missing Out)',
  },
  stragglers: {
    id: 'course.admin.course.stragglers',
    defaultMessage: 'Stragglers',
  },
  otot: {
    id: 'course.admin.course.otot',
    defaultMessage: 'OTOT (Own Time, Own Target)',
  },
  fixedDescription: {
    id: 'course.admin.course.fixedDescription',
    defaultMessage:
      'Assessments will open and close according to their default opening and closing reference times.',
  },
  fomoDescription: {
    id: 'course.admin.course.fomoDescription',
    defaultMessage:
      'Subsequent opening reference timings will be brought forward if students complete their assessments early.',
  },
  stragglersDescription: {
    id: 'course.admin.course.stragglersDescription',
    defaultMessage:
      'Leave no one behind; subsequent closing reference timings will be pushed back if students complete their assessments late.',
  },
  ototDescription: {
    id: 'course.admin.course.ototDescription',
    defaultMessage:
      'Both opening and closing reference timings can be adjusted based on FOMO and Stragglers rules.',
  },
  earlyPreview: {
    id: 'course.admin.course.earlyPreview',
    defaultMessage: 'Early preview',
  },
  earlyPreviewDescription: {
    id: 'course.admin.course.earlyPreviewDescription',
    defaultMessage:
      'Allow students to attempt assessments that start at a future time if they have fulfilled the unlock conditions.',
  },
  daysInAdvance: {
    id: 'course.admin.course.daysInAdvance',
    defaultMessage: 'Days in advance',
  },
  deleteCourse: {
    id: 'course.admin.course.deleteCourse',
    defaultMessage: 'Delete course',
  },
  deleteCourseWarning: {
    id: 'course.admin.course.deleteCourseWarning',
    defaultMessage:
      'Once you delete this course, you will NOT be able to access it anymore. All data associated with this course will be permanently deleted as well.',
  },
  deleteThisCourse: {
    id: 'course.admin.course.deleteThisCourse',
    defaultMessage: 'Delete this course',
  },
  timeSettings: {
    id: 'course.admin.course.timeSettings',
    defaultMessage: 'Time settings',
  },
  titleRequired: {
    id: 'course.admin.course.titleRequired',
    defaultMessage: 'Course name is required.',
  },
  startTimeRequired: {
    defaultMessage: 'Start time is required.',
  },
  endMustAfterStartTime: {
    defaultMessage: 'End time must be before starting time.',
  },
  invalidTimeFormat: {
    defaultMessage: 'Invalid Date and/or Time',
  },
  deleteCoursePromptAction: {
    id: 'course.admin.assessment.deleteCoursePromptAction',
    defaultMessage: 'Delete course',
  },
  deleteCoursePromptTitle: {
    id: 'course.admin.assessment.deleteCoursePromptTitle',
    defaultMessage: "Really, really sure you're deleting {title}?",
  },
  deleteCourseSuccess: {
    id: 'course.admin.assessment.deleteCourseSuccess',
    defaultMessage:
      'This course has been deleted. Redirecting you to courses page...',
  },
});
