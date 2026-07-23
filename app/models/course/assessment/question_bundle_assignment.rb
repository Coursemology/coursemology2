# frozen_string_literal: true
class Course::Assessment::QuestionBundleAssignment < ApplicationRecord
  belongs_to :user, inverse_of: :question_bundle_assignments
  belongs_to :assessment, class_name: 'Course::Assessment',
                          foreign_key: :assessment_id, inverse_of: :question_bundle_assignments
  belongs_to :submission, class_name: 'Course::Assessment::Attempt', optional: true,
                          foreign_key: :submission_id, inverse_of: :question_bundle_assignments
  belongs_to :question_bundle, class_name: 'Course::Assessment::QuestionBundle',
                               foreign_key: :bundle_id, inverse_of: :question_bundle_assignments

  validate :submission_belongs_to_assessment_and_user

  # Coerce a `Course::Assessment::Submission` passed here into its `Attempt` (the association's
  # real target post-repoint) — mirrors the same coercion on `Course::Assessment::Answer`/
  # `Course::Assessment::SubmissionQuestion` (see `Answer#submission=` for the full rationale).
  # `spec/controllers/course/assessment/submission/submissions_controller_spec.rb`'s
  # `randomized_submission` fixture passes the `Submission` half directly.
  def submission=(value)
    value = value.attempt if value.is_a?(Course::Assessment::Submission)
    super
  end

  private

  def submission_belongs_to_assessment_and_user
    return unless submission.present? && (submission.creator != user || submission.assessment != assessment)

    errors.add(:submission, :must_belong_to_assessment_and_user)
  end
end
