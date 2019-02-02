# frozen_string_literal: true
class Course::Assessment::QuestionBundle < ApplicationRecord
  belongs_to :question_group, class_name: Course::Assessment::QuestionGroup.name,
                              foreign_key: :group_id, inverse_of: :question_bundles
  has_many :question_bundle_questions, class_name: Course::Assessment::QuestionBundleQuestion.name,
                                       foreign_key: :bundle_id, inverse_of: :question_bundle, dependent: :destroy
  has_many :questions, through: :question_bundle_questions, class_name: Course::Assessment::Question.name
  has_many :question_bundle_assignments, class_name: Course::Assessment::QuestionBundleAssignment.name,
                                         foreign_key: :bundle_id, inverse_of: :question_bundle, dependent: :destroy

  validates :title, presence: true
end
