# frozen_string_literal: true
class Course::UserAchievement < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?
  after_create :send_notification

  validate :validate_course_user_in_course, on: :create

  belongs_to :course_user, inverse_of: :course_user_achievements
  belongs_to :achievement, class_name: Course::Achievement.name,
                           inverse_of: :course_user_achievements

  private

  # Set default values
  def set_defaults
    self.obtained_at ||= Time.zone.now
  end

  def send_notification
    return unless course_user.student?

    Course::AchievementNotifier.achievement_gained(course_user.user, achievement)
  end

  def validate_course_user_in_course
    errors.add(:course_user, :not_in_course) unless course_user.course_id == achievement.course_id
  end
end
