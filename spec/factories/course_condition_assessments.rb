FactoryGirl.define do
  factory :course_condition_assessment,
          class: Course::Condition::Assessment.name, aliases: [:assessment_condition] do
    course
    assessment
    association :conditional, factory: :course_achievement
    minimum_grade_percentage nil
  end
end
