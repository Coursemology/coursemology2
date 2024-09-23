# frozen_string_literal: true
FactoryBot.define do
  factory :instance_user do
    transient do
      user_name { nil }
    end
    instance
    role { :normal }

    after(:build) do |instance_user, evaluator|
      instance_user.user ||= if evaluator.user_name
                               build(:user, name: evaluator.user_name, instance_users: [instance_user])
                             else
                               build(:user, instance_users: [instance_user])
                             end
    end

    trait :instructor do
      role { :instructor }
    end
  end

  factory :instance_administrator, parent: :instance_user do
    role { :administrator }
  end
end
