# frozen_string_literal: true
class Course::Condition::Achievement < ApplicationRecord
  acts_as_condition

  # Trigger for evaluating the satisfiability of conditionals for a course user
  Course::UserAchievement.after_save do |achievement|
    Course::Condition::Achievement.on_dependent_status_change(achievement)
  end

  Course::UserAchievement.after_destroy do |achievement|
    Course::Condition::Achievement.on_dependent_status_change(achievement)
  end

  validate :validate_achievement_condition, if: :achievement_id_changed?
  after_save :clear_duplication_flag

  belongs_to :achievement, class_name: Course::Achievement.name, inverse_of: :achievement_conditions

  default_scope { includes(:achievement) }

  delegate :title, to: :achievement
  alias_method :dependent_object, :achievement

  # Checks if the user has the required achievement.
  #
  # @param [CourseUser] course_user The user that the achievement condition is being checked on. The
  #   user must respond to `achievements` and returns an ActiveRecord::Association that
  #   contains all achievements the subject has obtained.
  # @return [Boolean] true if the user has the required achievement and false otherwise.
  def satisfied_by?(course_user)
    # Unpublished achievements are considered not satisfied.
    return false unless achievement.published?

    course_user.achievements.exists?(achievement)
  end

  # Class that the condition depends on.
  def self.dependent_class
    Course::Achievement.name
  end

  def self.on_dependent_status_change(achievement)
    return unless achievement.changes.any? || achievement.destroyed?
    achievement.execute_after_commit { evaluate_conditional_for(achievement.course_user) }
  end

  def initialize_duplicate(duplicator, other)
    self.achievement = duplicator.duplicate(other.achievement)
    self.conditional_type = other.conditional_type # this is a simple string
    self.conditional = duplicator.duplicate(other.conditional)

    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
    end

    @duplicating = true
  end

  private

  # Given a conditional object, returns all achievements that it requires.
  #
  # @param [#conditions] conditional The object that is declared as acts_as_conditional and for
  #   which returned achievements are required.
  # @return [Array<Course::Achievement>]
  def required_achievements_for(conditional)
    # Course::Condition::Achievement.
    #   joins { condition.conditional(Course::Achievement) }.
    #   where.has { condition.conditional.id == achievement.id }.
    #   map(&:achievement)

    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390) that will allow
    # allow the above query to work without #reload
    # TODO: use squeel
    Course::Achievement.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.achievement_id
          FROM course_condition_achievements cca INNER JOIN course_conditions cc
            ON cc.actable_type = 'Course::Condition::Achievement' AND cc.actable_id = cca.id
            WHERE cc.conditional_id = #{conditional.id}
              AND cc.conditional_type = #{ActiveRecord::Base.sanitize(conditional.class.name)}
        ) ids
      ON ids.achievement_id = course_achievements.id
    SQL
  end

  def validate_achievement_condition
    validate_references_self
    validate_unique_dependency unless @duplicating
    validate_acyclic_dependency
  end

  def validate_references_self
    return unless achievement == conditional
    errors.add(:achievement, :references_self)
  end

  def validate_unique_dependency
    return unless required_achievements_for(conditional).include?(achievement)
    errors.add(:achievement, :unique_dependency)
  end

  def validate_acyclic_dependency
    return unless cyclic?
    errors.add(:achievement, :cyclic_dependency)
  end

  def clear_duplication_flag
    @duplicating = nil
  end
end
