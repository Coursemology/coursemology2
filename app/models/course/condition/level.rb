# frozen_string_literal: true
class Course::Condition::Level < ApplicationRecord
  acts_as_condition

  # Trigger for evaluating the satisfiability of conditionals for a course user
  Course::ExperiencePointsRecord.after_save do |record|
    Course::Condition::Level.on_dependent_status_change(record)
  end

  validates :minimum_level, numericality: { greater_than: 0 }

  def title
    self.class.human_attribute_name('title.title', value: minimum_level)
  end

  def dependent_object
    nil
  end

  # Checks if the user satisfies the minimum level condition.
  #
  # @param [CourseUser] course_user The user that the level condition is being checked on. The user
  #   must respond to `level_number` message and return the user's current level as an Integer.
  # @return [Boolean] true if the user is above or equal the minimum level and false otherwise.
  def satisfied_by?(course_user)
    course_user.level_number >= minimum_level
  end

  def initialize_duplicate(duplicator, other)
    self.conditional = duplicator.duplicate(other.conditional)
    self.course = duplicator.options[:target_course]
  end

  # Class that the condition depends on.
  def self.dependent_class
    nil
  end

  def self.on_dependent_status_change(record)
    return unless record.changes.key?(:points_awarded)
    record.execute_after_commit { evaluate_conditional_for(record.course_user) }
  end
end
