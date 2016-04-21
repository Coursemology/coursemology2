# frozen_string_literal: true
class Course::Achievement < ActiveRecord::Base
  acts_as_conditional
  mount_uploader :badge, ImageUploader

  after_initialize :set_defaults, if: :new_record?

  belongs_to :course, inverse_of: :achievements
  has_many :course_user_achievements, class_name: Course::UserAchievement.name,
                                      inverse_of: :achievement, dependent: :destroy
  has_many :course_users, through: :course_user_achievements, class_name: CourseUser.name

  default_scope { order(weight: :asc) }

  # Set default values
  def set_defaults
    self.weight ||= 10
  end

  # Returns if achievement is manually or automatically awarded.
  #
  # @return [Boolean] Whether the achievement is manually awarded.
  def manually_awarded?
    # TODO: Correct call should be conditions.empty?, but that results in an
    # exception due to polymorphism. To investigate.
    specific_conditions.empty?
  end

  def permitted_for!(_course_user)
  end

  def precluded_for!(_course_user)
  end
end
