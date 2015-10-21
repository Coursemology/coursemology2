FactoryGirl.define do
  factory :course_assessment_question_text_response,
          class: Course::Assessment::Question::TextResponse,
          parent: :course_assessment_question do
    solutions do
      [
        build(:course_assessment_question_text_response_solution,
              question: nil, solution: 'exact match', explanation: 'explanation'),
        build(:course_assessment_question_text_response_solution,
              question: nil, solution: 'partial', explanation: 'partial explanation',
              solution_type: :keyword)
      ]
    end
  end
end
