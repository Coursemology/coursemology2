# frozen_string_literal: true
class Course::LessonPlan::Item < ActiveRecord::Base
  actable
  has_many_attachments

  after_initialize :set_default_values, if: :new_record?

  validate :validate_presence_of_bonus_end_at,
           :validate_start_at_cannot_be_after_end_at

  # @!method self.ordered_by_date
  #   Orders the lesson plan items by the starting date.
  scope :ordered_by_date, (lambda do
    order { start_at }
  end)

  belongs_to :course, inverse_of: :lesson_plan_items
  has_many :todos, class_name: Course::LessonPlan::Todo, inverse_of: :item, dependent: :destroy

  # Gives the maximum number of EXP Points that an EXP-awarding item
  # is allocated to give, which is the sum of base and bonus EXPs.
  #
  # @return [Integer] Maximum EXP awardable.
  def total_exp
    base_exp + time_bonus_exp + extra_bonus_exp
  end

  private

  # Sets default EXP values
  def set_default_values
    self.base_exp ||= 0
    self.time_bonus_exp ||= 0
    self.extra_bonus_exp ||= 0
  end

  # User must set bonus_end_at if there's bonus exp
  def validate_presence_of_bonus_end_at
    if time_bonus_exp && time_bonus_exp > 0 && bonus_end_at.blank?
      errors.add(:bonus_end_at, :required)
    end
  end

  def validate_start_at_cannot_be_after_end_at
    return unless end_at && start_at > end_at
    errors.add(:start_at, :cannot_be_after_end_at)
  end
end
