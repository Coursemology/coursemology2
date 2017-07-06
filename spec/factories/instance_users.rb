# frozen_string_literal: true
FactoryGirl.define do
  factory :instance_user do
    instance
    role :normal

    after(:build) do |instance_user|
      instance_user.user ||= build(:user, instance_users: [instance_user])
    end

    trait :instructor do
      role :instructor
    end
  end

  factory :instance_administrator, parent: :instance_user do
    role :administrator
  end
end
