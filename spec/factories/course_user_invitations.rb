# frozen_string_literal: true
FactoryBot.define do
  factory :course_user_invitation, class: Course::UserInvitation do
    course
    sequence(:name) { |n| "course user #{n}" }
    email { generate(:email) }

    trait :confirmed do
      confirmed_at 1.day.ago
      confirmer { build(:user) }
    end
  end
end
