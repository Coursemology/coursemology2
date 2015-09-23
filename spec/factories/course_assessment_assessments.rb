FactoryGirl.define do
  sequence(:course_assessment_assessment_name) { |n| "Assessment #{n}" }
  factory :course_assessment_assessment, class: Course::Assessment, aliases: [:assessment],
                                         parent: :course_lesson_plan_item do
    tab { build(:course_assessment_tab, course: course) }
    title { generate(:course_assessment_assessment_name) }
    base_exp 1000
  end
end
