# frozen_string_literal: true
class Course::Assessment::QuestionGroup < ApplicationRecord
  belongs_to :assessment, class_name: Course::Assessment.name, inverse_of: :question_groups
  has_many :question_bundles, class_name: Course::Assessment::QuestionBundle.name,
                              foreign_key: :group_id, inverse_of: :question_group, dependent: :destroy

  validates :title, presence: true
  validates :weight, presence: true, numericality: { only_integer: true }
end
