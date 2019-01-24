# frozen_string_literal: true
class Course::Assessment::QuestionBundleAssignment < ApplicationRecord
  belongs_to :user, inverse_of: :question_bundle_assignments
  belongs_to :assessment, class_name: Course::Assessment.name,
                          foreign_key: :assessment_id, inverse_of: :question_bundle_assignments
  belongs_to :submission, class_name: Course::Assessment::Submission.name, optional: true,
                          foreign_key: :submission_id, inverse_of: :question_bundle_assignments
  belongs_to :question_bundle, class_name: Course::Assessment::QuestionBundle.name,
                               foreign_key: :bundle_id, inverse_of: :question_bundle_assignments

  validate :submission_belongs_to_assessment_and_user

  private

  def submission_belongs_to_assessment_and_user
    return unless submission.present? && (submission.creator != user || submission.assessment != assessment)

    errors.add(:submission, :must_belong_to_assessment_and_user)
  end
end
