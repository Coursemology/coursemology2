FactoryGirl.define do
  factory :course_assessment_question_text_response_solution,
          class: Course::Assessment::Question::TextResponseSolution do
    question { build(:course_assessment_question_text_response) }
    solution 'sample exact match'
    explanation 'explanation for exact match'
  end
end
