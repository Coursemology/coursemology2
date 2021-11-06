import { defineMessages } from 'react-intl';

const translations = defineMessages({
  component: {
    id: 'course.UserSubscriptions.component',
    defaultMessage: 'Topic',
  },
  setting: {
    id: 'course.UserSubscriptions.setting',
    defaultMessage: 'Setting',
  },
  description: {
    id: 'course.UserSubscriptions.description',
    defaultMessage: 'Description',
  },
  enabled: {
    id: 'course.UserSubscriptions.enabled',
    defaultMessage: 'Enabled?',
  },
  emailSubscriptions: {
    id: 'course.UserSubscriptions.emailSubscriptions',
    defaultMessage: 'Email Subscriptions',
  },
  updateSuccess: {
    id: 'course.UserSubscriptions.updateSuccess',
    defaultMessage: 'Email subscription for "{topic}" has been {action}.',
  },
  updateFailure: {
    id: 'course.UserSubscriptions.updateFailure',
    defaultMessage: 'Failed to update email subscription for "{topic}".',
  },
  unsubscribeSuccess: {
    id: 'course.UserSubscriptions.unsubscribeSuccess',
    defaultMessage: 'You have successfully unsubscribed from the topics above.',
  },
  noEmailSubscriptionSettings: {
    id: 'course.UserSubscriptions.noEmailSubscriptionSettings',
    defaultMessage: 'There is no available email subscription setting.',
  },
  viewAllEmailSubscriptionSettings: {
    id: 'course.UserSubscriptions.viewAllEmailSubscriptionSettings',
    defaultMessage: 'View and manage all your other email subscriptions.',
  },
});

export const subscriptionComponents = defineMessages({
  announcements: {
    id: 'course.UserSubscriptions.subscriptionComponents.announcements',
    defaultMessage: 'Announcements',
  },
  assessments: {
    id: 'course.UserSubscriptions.subscriptionComponents.assessments',
    defaultMessage: 'Assessments',
  },
  forums: {
    id: 'course.UserSubscriptions.subscriptionComponents.forums',
    defaultMessage: 'Forums',
  },
  surveys: {
    id: 'course.UserSubscriptions.subscriptionComponents.surveys',
    defaultMessage: 'Surveys',
  },
  users: {
    id: 'course.UserSubscriptions.subscriptionComponents.users',
    defaultMessage: 'Users',
  },
  videos: {
    id: 'course.UserSubscriptions.subscriptionComponents.videos',
    defaultMessage: 'Videos',
  },
});

export const subscriptionTitles = defineMessages({
  new_announcement: {
    id: 'course.UserSubscriptions.subscriptionTitles.new_announcement',
    defaultMessage: 'New Announcement',
  },
  opening_reminder: {
    id: 'course.UserSubscriptions.subscriptionTitles.opening_reminder',
    defaultMessage: 'Opening Reminder',
  },
  closing_reminder: {
    id: 'course.UserSubscriptions.subscriptionTitles.closing_reminder',
    defaultMessage: 'Closing Reminder',
  },
  closing_reminder_summary: {
    id: 'course.UserSubscriptions.subscriptionTitles.closing_reminder_summary',
    defaultMessage: 'Closing Reminder Summary',
  },
  grades_released: {
    id: 'course.UserSubscriptions.subscriptionTitles.grades_released',
    defaultMessage: 'Grades Released',
  },
  new_comment: {
    id: 'course.UserSubscriptions.subscriptionTitles.new_comment',
    defaultMessage: 'Submission Comment',
  },
  new_submission: {
    id: 'course.UserSubscriptions.subscriptionTitles.new_submission',
    defaultMessage: 'New Submission',
  },
  new_topic: {
    id: 'course.UserSubscriptions.subscriptionTitles.new_topic',
    defaultMessage: 'New Topic',
  },
  post_replied: {
    id: 'course.UserSubscriptions.subscriptionTitles.post_replied',
    defaultMessage: 'New Post and Reply',
  },
  new_enrol_request: {
    id: 'course.UserSubscriptions.subscriptionTitles.new_enrol_request',
    defaultMessage: 'New Enrol Request',
  },
});

export const subscriptionDescriptions = defineMessages({
  announcements_new_announcement: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.announcements_new_announcement',
    defaultMessage: 'Stay notified whenever a new announcement is made.',
  },
  assessments_opening_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments_opening_reminder',
    defaultMessage: 'Be notified when a new assignment is available.',
  },
  assessments_closing_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments_closing_reminder',
    defaultMessage: 'Be notified when an assignment about to be due.',
  },
  assessments_closing_reminder_summary: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments',
    defaultMessage:
      'Receive an email containing a list of students who receive closing reminders for an assignment.',
  },
  assessments_grades_released: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments_grades_released',
    defaultMessage: 'Be notified when your submission has been graded.',
  },
  assessments_new_comment: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments_new_comment',
    defaultMessage:
      'Be notified when you receive comments and replies for an assignment.',
  },
  assessments_new_submission: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.assessments_new_submission',
    defaultMessage: 'Be notified when your student creates a new submission.',
  },
  forums_new_topic: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.forums_new_topic',
    defaultMessage:
      'Be notified when there are new topics created for forums that you are subscribed to.',
  },
  forums_post_replied: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.forums_post_replied',
    defaultMessage:
      'Be notified when there are posts and replies for forum topics you are subscribed to.',
  },
  surveys_opening_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.surveys_opening_reminder',
    defaultMessage: 'Be notified when a new survey is available.',
  },
  surveys_closing_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.surveys_closing_reminder',
    defaultMessage: 'Be notified when a survey is about to expire.',
  },
  surveys_closing_reminder_summary: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.surveys_closing_reminder_summary',
    defaultMessage:
      'Receive an email containing a list of students who receive closing reminders for a survey.',
  },
  videos_opening_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.videos_opening_reminder.',
    defaultMessage: 'Be notified when a new video is available.',
  },
  videos_closing_reminder: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.videos_closing_reminder',
    defaultMessage: 'Be notified when a video is about to expire.',
  },
  users_new_enrol_request: {
    id: 'course.UserSubscriptions.subscriptionDescriptions.users_new_enrol_request',
    defaultMessage: 'Be notified when a new course enrolment request is made.',
  },
});

export default translations;
