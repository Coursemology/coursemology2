FactoryGirl.define do
  factory :course_assessment_question_multiple_response,
          class: Course::Assessment::Question::MultipleResponse,
          parent: :course_assessment_question do
    options do
      [
        build(:course_assessment_question_multiple_response_option,
              question: nil, correct: true, option: 'true', explanation: 'correct'),
        build(:course_assessment_question_multiple_response_option,
              question: nil, option: 'false', explanation: 'wrong')
      ]
    end
  end
end
