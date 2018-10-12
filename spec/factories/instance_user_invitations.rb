# frozen_string_literal: true
FactoryBot.define do
  factory :instance_user_invitation, class: Instance::UserInvitation do
    instance
    sequence(:name) { |n| "instance user #{n}" }
    email { generate(:email) }

    trait :confirmed do
      confirmed_at { 1.day.ago }
      confirmer { build(:user) }
    end
  end
end