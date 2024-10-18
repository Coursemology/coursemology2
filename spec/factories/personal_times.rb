# frozen_string_literal: true
FactoryBot.define do
  factory :personal_time, class: 'Course::PersonalTime' do
    association :course_user, factory: :course_user
    association :lesson_plan_item, factory: :lesson_plan_item
    start_at { Time.now }
    end_at { Time.now + 1.hour }
  end
end
