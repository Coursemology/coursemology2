# frozen_string_literal: true
FactoryBot.define do
  factory :course_lesson_plan_item, class: Course::LessonPlan::Item.name do
    course
    base_exp          { rand(1..10) * 100 }
    time_bonus_exp    { rand(1..10) * 100 }
    start_at { 1.day.ago }
    bonus_end_at { 1.day.from_now }
    end_at { nil }
    sequence(:title) { |n| "Example Lesson Plan Item #{n}" }

    trait :with_bonus_end_time do
      bonus_end_at { 2.days.from_now }
    end

    trait :with_end_time do
      end_at { 3.days.from_now }
    end
  end
end
