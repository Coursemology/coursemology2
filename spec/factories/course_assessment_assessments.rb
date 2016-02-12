# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_assessment_assessment_name) { |n| "Assessment #{n}" }
  factory :course_assessment_assessment, class: Course::Assessment, aliases: [:assessment],
                                         parent: :course_lesson_plan_item do
    tab do
      category = course.assessment_categories.first
      category.try(:tabs).try(:first) || build(:course_assessment_tab, course: course)
    end
    title { generate(:course_assessment_assessment_name) }
    base_exp 1000

    trait :unopened do
      start_at { 1.day.from_now }
    end

    trait :with_mcq_question do
      after(:build) do |assessment|
        question = build(:course_assessment_question_multiple_response, assessment: assessment)
        assessment.multiple_response_questions << question
      end
    end

    trait :with_programming_question do
      after(:build) do |assessment|
        question = build(:course_assessment_question_programming, :auto_gradable,
                         template_package: true, template_package_deferred: false,
                         assessment: assessment)
        assessment.programming_questions << question
      end
    end

    trait :with_text_response_question do
      after(:build) do |assessment|
        question = build(:course_assessment_question_text_response, assessment: assessment)
        assessment.text_response_questions << question
      end
    end

    trait :with_all_question_types do
      with_mcq_question
      with_programming_question
      with_text_response_question
    end

    trait :worksheet do
      display_mode :worksheet
    end

    trait :guided do
      display_mode :guided
    end
  end
end
