class Course::Condition::Level < ActiveRecord::Base
  acts_as_condition
  validates :minimum_level, numericality: { greater_than: 0 }

  def title
    self.class.human_attribute_name('title.title', value: minimum_level)
  end

  def dependent_objects
    []
  end

  # Checks if the user satisfies the minimum level condition.
  #
  # @param [CourseUser] course_user The user that the level condition is being checked on. The user
  #   must respond to `level_number` message and return the user's current level as an Fixnum.
  # @return [Boolean] true if the user is above or equal the minimum level and false otherwise.
  def satisfied_by?(course_user)
    course_user.level_number >= minimum_level
  end

  # Array of classes that the condition depends on.
  def self.dependent_classes
    []
  end
end
