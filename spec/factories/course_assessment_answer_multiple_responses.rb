# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_multiple_response,
          class: Course::Assessment::Answer::MultipleResponse,
          parent: :course_assessment_answer do
    transient do
      question_traits nil
    end

    question do
      build(:course_assessment_question_multiple_response, *question_traits,
            assessment: assessment).question
    end

    trait :with_all_wrong_options do
      after(:build) do |answer|
        question = answer.question.actable
        wrong_options = question.options - question.options.select(&:correct)
        wrong_options.each { |option| answer.options << option }
      end
    end

    trait :with_all_correct_options do
      after(:build) do |answer|
        question = answer.question.actable
        correct_options = question.options.select(&:correct)
        correct_options.each { |option| answer.options << option }
      end
    end

    trait :with_one_correct_option do
      after(:build) do |answer|
        question = answer.question.actable
        correct_options = question.options.select(&:correct)
        answer.options << correct_options.sample(1)
      end
    end
  end
end
