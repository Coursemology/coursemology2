class Course::Condition::Achievement < ActiveRecord::Base
  acts_as_condition
  belongs_to :achievement, class_name: Course::Achievement.name, inverse_of: false

  default_scope { includes(:achievement) }

  validate :validate_achievement_condition, if: :achievement_id_changed?

  delegate :title, to: :achievement

  private

  # Given an achievement, returns all its achievement conditions.
  #
  # @param [Course::Achievement] achievement The achievement to return achievement conditions for.
  # @return [Array<Course::Achievement>]
  def achievement_conditions(achievement)
    # Course::Condition::Achievement.
    #   joins { condition.conditional(Course::Achievement) }.
    #   where { condition.conditional.id == achievement.id }.
    #   map(&:achievement)

    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390) that will allow
    # allow the above query to work without #reload
    Course::Achievement.joins(
      "INNER JOIN
        (SELECT cca.achievement_id
          FROM course_condition_achievements cca INNER JOIN course_conditions cc
            ON cc.actable_type = 'Course::Condition::Achievement' AND cc.actable_id = cca.id
            WHERE cc.conditional_id = #{achievement.id}) ids
    ON ids.achievement_id = course_achievements.id")
  end

  def validate_achievement_condition
    validate_references_self
    validate_unique_dependency
  end

  def validate_references_self
    return unless achievement == conditional
    errors.add(:achievement, :references_self)
  end

  def validate_unique_dependency
    return unless achievement_conditions(conditional).include?(achievement)
    errors.add(:achievement, :unique_dependency)
  end
end
