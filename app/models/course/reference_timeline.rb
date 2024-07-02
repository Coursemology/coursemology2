# frozen_string_literal: true
class Course::ReferenceTimeline < ApplicationRecord
  belongs_to :course, inverse_of: :reference_timelines
  has_many :reference_times,
           class_name: 'Course::ReferenceTime', inverse_of: :reference_timeline, dependent: :destroy
  has_many :course_users, foreign_key: :reference_timeline_id, inverse_of: :reference_timeline,
                          dependent: :restrict_with_error

  before_validation :set_weight, if: :new_record?

  validates :default, inclusion: { in: [true, false] }, uniqueness: { scope: :course_id, if: :default }
  validates :course, presence: true
  validates :title, presence: true, unless: :default
  validates :weight, presence: true, numericality: { only_integer: true }

  before_destroy :prevent_destroy_if_default, prepend: true

  default_scope { order(:weight) }

  def initialize_duplicate(duplicator, _other)
    self.course = duplicator.options[:destination_course]
    self.reference_times = []
  end

  private

  def prevent_destroy_if_default
    return true unless !course.destroying? && default?

    errors.add(:default, :cannot_destroy)
    throw(:abort)
  end

  def set_weight
    return if weight.present?

    if default?
      self.weight = 0
      return
    end

    max_weight = course.reference_timelines.maximum(:weight)
    self.weight ||= max_weight.nil? ? 1 : max_weight + 1
  end
end
