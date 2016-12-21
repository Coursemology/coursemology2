# frozen_string_literal: true
FactoryGirl.define do
  factory :course_user_invitation, class: Course::UserInvitation do
    course
    sequence(:name) { |n| "course user #{n}" }
    sequence(:email) { |n| "user_#{n}@domain_#{base_time}_name.com" }
  end
end
