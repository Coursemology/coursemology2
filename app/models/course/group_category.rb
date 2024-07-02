# frozen_string_literal: true
class Course::GroupCategory < ApplicationRecord
  validates :name, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true
  validates :name, uniqueness: { scope: [:course_id], if: -> { course_id? && name_changed? } }
  validates :course_id, uniqueness: { scope: [:name], if: -> { name? && course_id_changed? } }

  belongs_to :course, inverse_of: :group_categories
  has_many :groups, dependent: :destroy, class_name: 'Course::Group', foreign_key: :group_category_id

  scope :ordered_by_name, -> { order(name: :asc) }
end
