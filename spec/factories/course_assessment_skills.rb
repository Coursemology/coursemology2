FactoryGirl.define do
  factory :course_assessment_skill, class: Course::Assessment::Skill do
    course
    title 'Skill'
    description 'Description'
  end
end
