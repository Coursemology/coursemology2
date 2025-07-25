# frozen_string_literal: true
class Course::Scholaistic::Assessment < ApplicationRecord
  acts_as_lesson_plan_item
  acts_as_conditional

  include Course::ClosingReminderConcern

  validates :upstream_id, presence: true, uniqueness: true

  has_many :scholaistic_assessment_conditions,
           class_name: Course::Condition::ScholaisticAssessment.name,
           inverse_of: :assessment, dependent: :destroy

  private

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
