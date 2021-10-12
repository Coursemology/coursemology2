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
    return unless course_user.real_student?

    Course::AssessmentNotifier.assessment_submitted(creator, course_user, self)
  end
end
