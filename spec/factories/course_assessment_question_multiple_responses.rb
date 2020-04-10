# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_multiple_response,
          class: Course::Assessment::Question::MultipleResponse,
          parent: :course_assessment_question do
    options do
      options =
        [
          build(:course_assessment_question_multiple_response_option,
                question: nil, correct: true, option: 'true', explanation: 'correct'),
          build(:course_assessment_question_multiple_response_option,
                question: nil, option: 'false', explanation: 'wrong')
        ]

      if any_correct?
        options << build(:course_assessment_question_multiple_response_option, :wrong,
                         question: nil, option: 'false', explanation: 'wrong alternatve')
        options << build(:course_assessment_question_multiple_response_option, :correct,
                         question: nil, option: 'also true', explanation: 'correct alternatve')
      end

      options
    end

    trait :all_correct do
      # Nothing to do, this is the default.
    end

    trait :any_correct do
      grading_scheme { :any_correct }
    end

    trait :multiple_choice do
      grading_scheme { :any_correct }
    end

    trait :randomized do
      randomize_options { true }
    end

    trait :with_non_randomized_option do
      options do
        options =
          [
            build(:course_assessment_question_multiple_response_option,
                  question: nil, correct: true, option: 'true', explanation: 'correct'),
            build(:course_assessment_question_multiple_response_option,
                  question: nil, option: 'false', explanation: 'wrong'),
            build(:course_assessment_question_multiple_response_option, :ignore_randomization,
                  question: nil, option: 'also false', explanation: 'wrong alternative')
          ]
      end
    end
  end
end
