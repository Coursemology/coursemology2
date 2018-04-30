# frozen_string_literal: true
module Course::Assessment::Submission::NotificationConcern
  extend ActiveSupport::Concern

  included do
    after_save :send_submit_notification, if: :submitted?
    after_create :send_attempt_notification
  end

  private

  def send_attempt_notification
    return unless course_user.real_student?

    Course::AssessmentNotifier.assessment_attempted(creator, assessment)
  end

  def send_submit_notification
    return unless workflow_state_before_last_save == 'attempting'
    return if assessment.autograded?
    return if !course_user.real_student? && !phantom_submission_email_enabled?

    Course::AssessmentNotifier.assessment_submitted(creator, course_user, self)
  end

  def phantom_submission_email_enabled?
    Course::Settings::AssessmentsComponent.
      email_enabled?(assessment.tab.category, :new_phantom_submission)
  end
end
