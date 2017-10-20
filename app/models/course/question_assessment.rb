# frozen_string_literal: true
class Course::QuestionAssessment < ApplicationRecord
  belongs_to :assessment, inverse_of: :question_assessments, class_name: Course::Assessment.name
  belongs_to :question, inverse_of: :question_assessments, class_name: Course::Assessment::Question.name

  default_scope { order(weight: :asc) }
end
