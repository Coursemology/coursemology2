# frozen_string_literal: true
# One external grade for a (external assessment, course_user). The binding key is
# course_user_id (the authoritative link to the person); imported_identifier is a
# non-authoritative snapshot of the email/Student ID used at import (audit + upsert
# mismatch detection), null for grades typed/edited inline.
class Course::ExternalAssessmentGrade < ApplicationRecord
  validates :course_user, presence: true
  validates :grade, numericality: true, allow_nil: true
  validates :course_user_id, uniqueness: { scope: :external_assessment_id }
  validates :creator, presence: true
  validates :updater, presence: true

  belongs_to :external_assessment, class_name: 'Course::ExternalAssessment',
                                   inverse_of: :external_assessment_grades
  belongs_to :course_user, inverse_of: :external_assessment_grades
end
