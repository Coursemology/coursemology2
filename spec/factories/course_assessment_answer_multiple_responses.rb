FactoryGirl.define do
  factory :course_assessment_answer_multiple_response,
          class: Course::Assessment::Answer::MultipleResponse,
          parent: :course_assessment_answer do
  end
end
