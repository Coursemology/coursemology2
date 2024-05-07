# frozen_string_literal: true
FactoryBot.define do
  factory :course_reference_time, class: 'Course::ReferenceTime' do
    association :lesson_plan_item, factory: :course_lesson_plan_item
    reference_timeline { association :course_reference_timeline, course: lesson_plan_item.course }
    start_at { 1.day.from_now }

    trait :with_bonus_end_time do
      bonus_end_at { 2.days.from_now }
    end

    trait :with_end_time do
      bonus_end_at { 3.days.from_now }
    end
  end
end
