# frozen_string_literal: true
FactoryBot.define do
  factory :course_user_achievement, class: Course::UserAchievement.name do
    transient do
      course { create(:course) }
    end

    course_user { association :course_user, course: course }
    achievement { association :achievement, course: course }
    obtained_at { '2015-10-11 23:20:07' }

    after(:build) do |object|
      if object.course_user.course_id != object.achievement.course_id
        object.achievement.course_id = object.course_user.course_id
      end
    end
  end
end
