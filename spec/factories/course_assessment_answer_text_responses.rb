FactoryGirl.define do
  factory :course_assessment_answer_text_response,
          class: Course::Assessment::Answer::TextResponse,
          parent: :course_assessment_answer do
    answer_text 'my answer contains partial match'
  end
end
