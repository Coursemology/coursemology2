# frozen_string_literal: true
FactoryBot.define do
  factory :user_notification do
    activity
    user

    trait :popup do
      notification_type :popup
    end

    trait :popup_with_achievement_gained do
      transient do
        achievement { create(:achievement) }
      end
      popup
      activity { create(:activity, :achievement_gained, object: achievement, actor: user) }

      after(:build) do |user_notification|
        course = user_notification.activity.object.course
        course_user = CourseUser.find_by(course: course, user: user_notification.user)
        create(:course_user, course: course) unless course_user
      end
    end

    trait :email do
      notification_type :email
    end
  end
end
