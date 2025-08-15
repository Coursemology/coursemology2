# frozen_string_literal: true
class Course::ScholaisticAssessment < ApplicationRecord
  acts_as_lesson_plan_item

  validates :upstream_id, presence: true, uniqueness: { scope: :course_id }
  validate :no_bonus_exp_attributes

  has_many :scholaistic_assessment_conditions,
           class_name: Course::Condition::ScholaisticAssessment.name,
           inverse_of: :scholaistic_assessment, dependent: :destroy

  has_many :submissions,
           class_name: Course::ScholaisticSubmission.name,
           inverse_of: :assessment, dependent: :destroy

  private

  # We don't allow Time Bonus EXPs for now because `start_at` and `end_at` are
  # controlled on the ScholAIstic side. Supporting Time Bonus EXPs will be
  # tricky if the `start_at` and `end_at` were set on ScholAIstic but Time
  # Bonus EXPs are not synced properly on Coursemology.
  def no_bonus_exp_attributes
    return unless time_bonus_exp != 0 || bonus_end_at.present?

    errors.add(:time_bonus_exp, :bonus_attributes_not_allowed)
  end

  # @override ConditionalInstanceMethods#permitted_for!
  def permitted_for!(course_user)
  end

  # @override ConditionalInstanceMethods#precluded_for!
  def precluded_for!(course_user)
  end

  # @override ConditionalInstanceMethods#satisfiable?
  def satisfiable?
    published?
  end
end
