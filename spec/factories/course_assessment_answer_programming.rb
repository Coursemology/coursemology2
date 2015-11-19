FactoryGirl.define do
  factory :course_assessment_answer_programming,
          class: Course::Assessment::Answer::Programming,
          parent: :course_assessment_answer do
  end
end
