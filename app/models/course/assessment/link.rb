# frozen_string_literal: true
class Course::Assessment::Link < ApplicationRecord
  belongs_to :assessment, class_name: 'Course::Assessment'
  belongs_to :linked_assessment, class_name: 'Course::Assessment'

  validates :assessment, :linked_assessment, presence: true
  validates :linked_assessment_id, uniqueness: { scope: :assessment_id }
end
