# frozen_string_literal: true
class Course::Assessment::QuestionBundle < ApplicationRecord
  belongs_to :question_group, class_name: 'Course::Assessment::QuestionGroup',
                              foreign_key: :group_id, inverse_of: :question_bundles
  has_many :question_bundle_questions, class_name: 'Course::Assessment::QuestionBundleQuestion',
                                       foreign_key: :bundle_id, inverse_of: :question_bundle, dependent: :destroy
  has_many :questions, through: :question_bundle_questions, class_name: 'Course::Assessment::Question'
  has_many :question_bundle_assignments, class_name: 'Course::Assessment::QuestionBundleAssignment',
                                         foreign_key: :bundle_id, inverse_of: :question_bundle, dependent: :destroy

  validates :title, presence: true
end
