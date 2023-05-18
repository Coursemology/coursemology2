export type SubscriptionComponent =
  | 'announcements'
  | 'assessments'
  | 'forums'
  | 'surveys'
  | 'users'
  | 'videos';

export type SubscriptionType =
  | 'new_announcement'
  | 'opening_reminder'
  | 'closing_reminder'
  | 'closing_reminder_summary'
  | 'grades_released'
  | 'new_comment'
  | 'new_submission'
  | 'new_topic'
  | 'post_replied'
  | 'new_enrol_request';
