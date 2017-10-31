# frozen_string_literal: true
FactoryBot.define do
  factory :user_notification do
    activity
    user

    trait :popup do
      notification_type :popup
    end

    trait :email do
      notification_type :email
    end
  end
end
