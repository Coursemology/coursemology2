# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_name) { |n| "Survey #{n}" }
  factory :course_survey, class: Course::Survey.name,
                          aliases: [:survey], parent: :course_lesson_plan_item do
    title { generate(:course_survey_name) }
    anonymous false
    allow_response_after_end false
    allow_modify_after_submit false
  end

  trait :published do
    published true
  end

  trait :unpublished do
    published false
  end

  trait :anonymous do
    anonymous true
  end

  trait :allow_response_after_end do
    allow_response_after_end true
  end

  trait :allow_modify_after_submit do
    allow_modify_after_submit true
  end

  trait :not_started do
    start_at { 1.day.from_now }
    end_at { 3.days.from_now }
  end

  trait :expired do
    start_at { 3.days.ago }
    end_at { 1.day.ago }
  end

  trait :currently_active do
    start_at { 2.days.ago }
    end_at { 2.days.from_now }
  end
end
