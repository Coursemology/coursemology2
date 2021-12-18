import { defineMessages } from 'react-intl';

const translations = defineMessages({
  component: {
    id: 'course.UserEmailSubscriptions.component',
    defaultMessage: 'Topic',
  },
  setting: {
    id: 'course.UserEmailSubscriptions.setting',
    defaultMessage: 'Setting',
  },
  description: {
    id: 'course.UserEmailSubscriptions.description',
    defaultMessage: 'Description',
  },
  enabled: {
    id: 'course.UserEmailSubscriptions.enabled',
    defaultMessage: 'Enabled?',
  },
  emailSubscriptions: {
    id: 'course.UserEmailSubscriptions.emailSubscriptions',
    defaultMessage: 'Email Subscriptions',
  },
  updateSuccess: {
    id: 'course.UserEmailSubscriptions.updateSuccess',
    defaultMessage: 'Email subscription for "{topic}" has been {action}.',
  },
  updateFailure: {
    id: 'course.UserEmailSubscriptions.updateFailure',
    defaultMessage: 'Failed to update email subscription for "{topic}".',
  },
  unsubscribeSuccess: {
    id: 'course.UserEmailSubscriptions.unsubscribeSuccess',
    defaultMessage: 'You have successfully unsubscribed from the topics above.',
  },
  noEmailSubscriptionSettings: {
    id: 'course.UserEmailSubscriptions.noEmailSubscriptionSettings',
    defaultMessage: 'There is no available email subscription setting.',
  },
  viewAllEmailSubscriptionSettings: {
    id: 'course.UserEmailSubscriptions.viewAllEmailSubscriptionSettings',
    defaultMessage: 'View and manage all your other email subscriptions.',
  },
});

export const subscriptionComponents = defineMessages({
  announcements: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.announcements',
    defaultMessage: 'Announcements',
  },
  assessments: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.assessments',
    defaultMessage: 'Assessments',
  },
  forums: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.forums',
    defaultMessage: 'Forums',
  },
  surveys: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.surveys',
    defaultMessage: 'Surveys',
  },
  users: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.users',
    defaultMessage: 'Users',
  },
  videos: {
    id: 'course.UserEmailSubscriptions.subscriptionComponents.videos',
    defaultMessage: 'Videos',
  },
});

export const subscriptionTitles = defineMessages({
  new_announcement: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.new_announcement',
    defaultMessage: 'New Announcement',
  },
  opening_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.opening_reminder',
    defaultMessage: 'Opening Reminder',
  },
  closing_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.closing_reminder',
    defaultMessage: 'Closing Reminder',
  },
  closing_reminder_summary: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.closing_reminder_summary',
    defaultMessage: 'Closing Reminder Summary',
  },
  grades_released: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.grades_released',
    defaultMessage: 'Grades Released',
  },
  new_comment: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.new_comment',
    defaultMessage: 'Submission Comment',
  },
  new_submission: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.new_submission',
    defaultMessage: 'New Submission',
  },
  new_topic: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.new_topic',
    defaultMessage: 'New Topic',
  },
  post_replied: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.post_replied',
    defaultMessage: 'New Post and Reply',
  },
  new_enrol_request: {
    id: 'course.UserEmailSubscriptions.subscriptionTitles.new_enrol_request',
    defaultMessage: 'New Enrol Request',
  },
});

export const subscriptionDescriptions = defineMessages({
  announcements_new_announcement: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.announcements_new_announcement',
    defaultMessage: 'Stay notified whenever a new announcement is made.',
  },
  assessments_opening_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments_opening_reminder',
    defaultMessage: 'Be notified when a new assignment is available.',
  },
  assessments_closing_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments_closing_reminder',
    defaultMessage: 'Be notified when an assignment about to be due.',
  },
  assessments_closing_reminder_summary: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments',
    defaultMessage:
      'Receive an email containing a list of students who receive closing reminders for an assignment.',
  },
  assessments_grades_released: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments_grades_released',
    defaultMessage: 'Be notified when your submission has been graded.',
  },
  assessments_new_comment: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments_new_comment',
    defaultMessage:
      'Be notified when you receive comments and replies for an assignment.',
  },
  assessments_new_submission: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.assessments_new_submission',
    defaultMessage: 'Be notified when your student creates a new submission.',
  },
  forums_new_topic: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.forums_new_topic',
    defaultMessage:
      'Be notified when there are new topics created for forums that you are subscribed to.',
  },
  forums_post_replied: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.forums_post_replied',
    defaultMessage:
      'Be notified when there are posts and replies for forum topics you are subscribed to.',
  },
  surveys_opening_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.surveys_opening_reminder',
    defaultMessage: 'Be notified when a new survey is available.',
  },
  surveys_closing_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.surveys_closing_reminder',
    defaultMessage: 'Be notified when a survey is about to expire.',
  },
  surveys_closing_reminder_summary: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.surveys_closing_reminder_summary',
    defaultMessage:
      'Receive an email containing a list of students who receive closing reminders for a survey.',
  },
  videos_opening_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.videos_opening_reminder.',
    defaultMessage: 'Be notified when a new video is available.',
  },
  videos_closing_reminder: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.videos_closing_reminder',
    defaultMessage: 'Be notified when a video is about to expire.',
  },
  users_new_enrol_request: {
    id: 'course.UserEmailSubscriptions.subscriptionDescriptions.users_new_enrol_request',
    defaultMessage: 'Be notified when a new course enrolment request is made.',
  },
});

export default translations;
