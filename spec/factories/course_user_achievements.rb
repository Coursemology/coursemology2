# frozen_string_literal: true
FactoryBot.define do
  factory :course_user_achievement, class: Course::UserAchievement.name do
    course_user
    achievement
    obtained_at '2015-10-11 23:20:07'
  end
end
