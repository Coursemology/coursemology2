# frozen_string_literal: true
class Course::UserAchievement < ActiveRecord::Base
  after_initialize :set_defaults, if: :new_record?

  belongs_to :course_user, inverse_of: :course_user_achievements
  belongs_to :achievement, class_name: Course::Achievement.name,
                           inverse_of: :course_user_achievements

  private

  # Set default values
  def set_defaults
    self.obtained_at ||= Time.zone.now
  end
end
