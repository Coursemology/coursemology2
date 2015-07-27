FactoryGirl.define do
  factory :course_assessment_question, class: Course::Assessment::Question do
    assessment
    title 'This awesome question'
    description 'Look at this awesome question'
    maximum_grade 2
  end
end
