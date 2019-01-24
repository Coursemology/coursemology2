# frozen_string_literal: true
class Course::Assessment::QuestionBundleQuestion < ApplicationRecord
  belongs_to :question_bundle, class_name: Course::Assessment::QuestionBundle.name,
                               foreign_key: :bundle_id, inverse_of: :question_bundle_questions
  belongs_to :question, class_name: Course::Assessment::Question.name,
                        foreign_key: :question_id, inverse_of: :question_bundle_questions

  validates :weight, presence: true, numericality: { only_integer: true }
  validates :question, uniqueness: { scope: :question_bundle }
end
