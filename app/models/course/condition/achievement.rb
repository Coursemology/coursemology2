class Course::Condition::Achievement < ActiveRecord::Base
  acts_as_condition
  belongs_to :achievement, class_name: Course::Achievement.name, inverse_of: false

  default_scope { includes(:achievement) }

  validate :validate_achievement_condition, if: :achievement_id_changed?

  delegate :title, to: :achievement

  def dependent_objects
    [achievement]
  end

  # Checks if the user has the required achievement.
  #
  # @param [CourseUser] course_user The user that the achievement condition is being checked on. The
  #   user must respond to `achievements` and returns an ActiveRecord::Association that
  #   contains all achievements the subject has obtained.
  # @return [Boolean] true if the user has the required achievement and false otherwise.
  def satisfied_by?(course_user)
    course_user.achievements.exists?(achievement)
  end

  # Array of classes that the condition depends on.
  def self.dependent_classes
    [Course::Achievement.name]
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
    #   where { condition.conditional.id == achievement.id }.
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
    validate_unique_dependency
  end

  def validate_references_self
    return unless achievement == conditional
    errors.add(:achievement, :references_self)
  end

  def validate_unique_dependency
    return unless required_achievements_for(conditional).include?(achievement)
    errors.add(:achievement, :unique_dependency)
  end
end
