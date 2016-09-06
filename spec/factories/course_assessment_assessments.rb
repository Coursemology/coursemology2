# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_assessment_assessment_name) { |n| "Assessment #{n}" }
  factory :course_assessment_assessment, class: Course::Assessment, aliases: [:assessment],
                                         parent: :course_lesson_plan_item do
    transient do
      question_count 1
    end

    tab do
      category = course.assessment_categories.first
      category.try(:tabs).try(:first) || build(:course_assessment_tab, course: course)
    end
    title { generate(:course_assessment_assessment_name) }
    base_exp 1000
    autograded false
    draft true

    trait :unopened do
      start_at { 1.day.from_now }
    end

    trait :with_mcq_question do
      after(:build) do |assessment, evalutor|
        evalutor.question_count.downto(1).each do
          question = build(:course_assessment_question_multiple_response,
                           :multiple_choice, assessment: assessment)
          assessment.questions << question.acting_as
        end
      end
    end

    trait :with_mrq_question do
      after(:build) do |assessment, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_assessment_question_multiple_response, assessment: assessment)
          assessment.questions << question.acting_as
        end
      end
    end

    trait :with_programming_question do
      after(:build) do |assessment, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_assessment_question_programming, :auto_gradable,
                           template_package: true, template_package_deferred: false,
                           assessment: assessment)
          assessment.questions << question.acting_as
        end
      end
    end

    trait :with_text_response_question do
      after(:build) do |assessment, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_assessment_question_text_response, :allow_attachment,
                           assessment: assessment)
          assessment.questions << question.acting_as
        end
      end
    end

    trait :with_all_question_types do
      with_mcq_question
      with_mrq_question
      with_programming_question
      with_text_response_question
    end

    trait :worksheet do
      display_mode :worksheet
    end

    trait :guided do
      display_mode :guided
    end

    # Note: Not to be used alone, as a published assessment requires at
    #   least 1 other question. Use the other published traits intead.
    trait :published do
      after(:build) do |assessment|
        assessment.draft = false
      end
    end

    trait :published_with_mcq_question do
      with_mcq_question
      published
    end

    trait :published_with_mrq_question do
      with_mrq_question
      published
    end

    trait :published_with_text_response_question do
      with_text_response_question
      published
    end

    trait :published_with_programming_question do
      with_programming_question
      published
    end

    trait :published_with_all_question_types do
      with_all_question_types
      published
    end

    trait :autograded do
      autograded true
    end
  end
end
