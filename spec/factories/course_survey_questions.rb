# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_question_name) { |n| "Survey Question #{n}" }
  factory :course_survey_question, class: Course::Survey::Question.name,
                                   aliases: [:survey_question] do
    transient do
      last_weight { section.questions.maximum(:weight) }
      option_count 3
      option_traits []
    end

    section
    weight { last_weight ? last_weight + 1 : 0 }
    description { generate(:course_survey_question_name) }
    question_type :text

    trait :multiple_choice do
      question_type :multiple_choice
      after(:build) do |question, evaluator|
        evaluator.option_count.downto(1).each do
          option = build(:course_survey_question_option, *evaluator.option_traits,
                         question: question)
          question.options << option
        end
      end
    end

    trait :multiple_response do
      question_type :multiple_response
      after(:build) do |question, evaluator|
        evaluator.option_count.downto(1).each do
          option = build(:course_survey_question_option, *evaluator.option_traits,
                         question: question)
          question.options << option
        end
      end
      min_options 1
      max_options 2
    end

    trait :text do
    end

    trait :required do
      required true
    end

    trait :grid_view do
      grid_view true
    end
  end
end
