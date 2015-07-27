FactoryGirl.define do
  factory :course_assessment_question_multiple_response,
          class: Course::Assessment::Question::MultipleResponse,
          parent: :course_assessment_question do
  end
end
