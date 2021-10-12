import { defineMessages } from 'react-intl';

const translations = defineMessages({
  setting: {
    id: 'course.admin.NotificationSettings.setting',
    defaultMessage: 'Setting',
  },
  description: {
    id: 'course.admin.NotificationSettings.description',
    defaultMessage: 'Description',
  },
  phantom: {
    id: 'course.admin.NotificationSettings.phantom',
    defaultMessage: 'Phantom',
  },
  regular: {
    id: 'course.admin.NotificationSettings.regular',
    defaultMessage: 'Regular',
  },
  emailSettings: {
    id: 'course.admin.NotificationSettings.emailSettings',
    defaultMessage: 'Email Settings',
  },
  updateSuccess: {
    id: 'course.admin.NotificationSettings.updateSuccess',
    defaultMessage:
      'The email setting "{setting}" for {user} user has been {action}.',
  },
  updateFailure: {
    id: 'course.admin.NotificationSettings.updateFailure',
    defaultMessage: 'Failed to update setting "{setting}".',
  },
  noEmailSettings: {
    id: 'course.admin.NotificationSettings.noEmailSettings',
    defaultMessage: 'None of the enabled components have email settings.',
  },
});

export const settingComponents = defineMessages({
  announcements: {
    id: 'course.admin.NotificationSettings.settingComponents.announcements',
    defaultMessage: 'Announcements',
  },
  assessments: {
    id: 'course.admin.NotificationSettings.settingComponents.assessments',
    defaultMessage: 'Assessments',
  },
  forums: {
    id: 'course.admin.NotificationSettings.settingComponents.forums',
    defaultMessage: 'Forums',
  },
  surveys: {
    id: 'course.admin.NotificationSettings.settingComponents.surveys',
    defaultMessage: 'Surveys',
  },
  users: {
    id: 'course.admin.NotificationSettings.settingComponents.users',
    defaultMessage: 'Users',
  },
  videos: {
    id: 'course.admin.NotificationSettings.settingComponents.videos',
    defaultMessage: 'Videos',
  },
});

export const settingTitles = defineMessages({
  new_announcement: {
    id: 'course.admin.NotificationSettings.settingTitles.new_announcement',
    defaultMessage: 'New Announcement',
  },
  opening_reminder: {
    id: 'course.admin.NotificationSettings.settingTitles.opening_reminder',
    defaultMessage: 'Opening Reminder',
  },
  closing_reminder: {
    id: 'course.admin.NotificationSettings.settingTitles.closing_reminder',
    defaultMessage: 'Closing Reminder',
  },
  closing_reminder_summary: {
    id: 'course.admin.NotificationSettings.settingTitles.closing_reminder_summary',
    defaultMessage: 'Closing Reminder Summary',
  },
  grades_released: {
    id: 'course.admin.NotificationSettings.settingTitles.grades_released',
    defaultMessage: 'Grades Released',
  },
  new_comment: {
    id: 'course.admin.NotificationSettings.settingTitles.new_comment',
    defaultMessage: 'New Comment',
  },
  new_submission: {
    id: 'course.admin.NotificationSettings.settingTitles.new_submission',
    defaultMessage: 'New Submission',
  },
  new_topic: {
    id: 'course.admin.NotificationSettings.settingTitles.new_topic',
    defaultMessage: 'New Topic',
  },
  post_replied: {
    id: 'course.admin.NotificationSettings.settingTitles.post_replied',
    defaultMessage: 'New Post and Reply',
  },
  new_enrol_request: {
    id: 'course.admin.NotificationSettings.settingTitles.new_enrol_request',
    defaultMessage: 'New Enrol Request',
  },
});

export const settingDescriptions = defineMessages({
  announcements_new_announcement: {
    id: 'course.admin.NotificationSettings.settingDescriptions.announcements_new_announcement',
    defaultMessage: 'Notify users whenever a new announcement is made.',
  },
  assessments_opening_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessments_opening_reminder',
    defaultMessage: 'Notify users when a new assessment is available.',
  },
  assessments_closing_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessment_closing_reminder',
    defaultMessage: 'Notify students when an assessment is about to be due.',
  },
  assessments_closing_reminder_summary: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessments_closing_reminder_summary',
    defaultMessage:
      'Notify staff when with a list of students who receive an assessment closing reminder.',
  },
  assessments_grades_released: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessments_grades_released',
    defaultMessage:
      'Notify a student when grades for a submission have been released.',
  },
  assessments_new_comment: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessments_new_comment',
    defaultMessage:
      'Notify users when comments or programming question annotations are made.',
  },
  assessments_new_submission: {
    id: 'course.admin.NotificationSettings.settingDescriptions.assessments_new_submission',
    defaultMessage:
      "Notify a student's group managers when the student makes a submission.",
  },
  forums_new_topic: {
    id: 'course.admin.NotificationSettings.settingDescriptions.forums_new_topic',
    defaultMessage:
      'Notify users who are subscribed to a forum when a topic is created for that forum.',
  },
  forums_post_replied: {
    id: 'course.admin.NotificationSettings.settingDescriptions.forums_post_replied',
    defaultMessage:
      'Notify users who are subscribed to a forum topic when a reply is made to that topic.',
  },
  surveys_opening_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.survey_opening_reminder',
    defaultMessage: 'Notify users when a new survey is available.',
  },
  surveys_closing_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.survey_closing_reminder',
    defaultMessage: 'Notify students when a survey is about to expire.',
  },
  surveys_closing_reminder_summary: {
    id: 'course.admin.NotificationSettings.settingDescriptions.surveys_closing_reminder_summary',
    defaultMessage:
      'Notify staff when with a list of students who receive a survey closing reminder.',
  },
  videos_opening_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.videos_opening_reminder',
    defaultMessage: 'Notify users when a new video is available.',
  },
  videos_closing_reminder: {
    id: 'course.admin.NotificationSettings.settingDescriptions.videos_closing_reminder',
    defaultMessage:
      'Notify students when a video submission is about to be due.',
  },
  users_new_enrol_request: {
    id: 'course.admin.NotificationSettings.settingDescriptions.users_new_enrol_request',
    defaultMessage: 'Notify staff when users request to enrol in the course.',
  },
});

export default translations;
