FactoryGirl.define do
  factory :course_notification, class: Course::Notification.name do
    activity

    trait :feed do
      notification_type :feed
    end

    trait :email do
      notification_type :email
    end
  end
end
