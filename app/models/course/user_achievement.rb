# frozen_string_literal: true
class Course::UserAchievement < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?
  after_create :send_notification

  belongs_to :course_user, inverse_of: :course_user_achievements
  belongs_to :achievement, class_name: Course::Achievement.name,
                           inverse_of: :course_user_achievements

  private

  # Set default values
  def set_defaults
    self.obtained_at ||= Time.zone.now
  end

  def send_notification
    return unless course_user.real_student?

    Course::AchievementNotifier.achievement_gained(course_user.user, achievement)
  end
end
