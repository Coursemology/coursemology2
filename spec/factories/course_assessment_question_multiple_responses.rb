FactoryGirl.define do
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

      options << build(:course_assessment_question_multiple_response_option,
                       question: nil, option: 'false',
                       explanation: 'wrong alternatve') if question_type.to_s == 'any_correct'

      options
    end

    trait :all_correct do
      # Nothing to do, this is the default.
    end

    trait :any_correct do
      question_type :any_correct
    end
  end
end
