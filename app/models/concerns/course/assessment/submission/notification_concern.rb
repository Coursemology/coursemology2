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
    # When a course staff submits/force submits a submission on behalf of the student,
    # the updater of the submission is set as the course staff, which is different from the creator (the student).
    # Even though a submission is force created by a course staff, the creator is still set
    # as the student as it's the only way to indicate that the submission belongs to the student.
    # In such case, there is no need to send a notification to the course staff that there is
    # a new submission to be graded since it was submitted by the course staff anyway.
    return unless creator == updater
    return if assessment.autograded?
    return unless course_user.real_student?

    Course::AssessmentNotifier.assessment_submitted(creator, course_user, self)
  end
end
