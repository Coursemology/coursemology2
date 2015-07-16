FactoryGirl.define do
  sequence(:course_assessment_assessment_name) { |n| "Assessment #{n}" }
  factory :course_assessment_assessment, class: Course::Assessment, aliases: [:assessment] do
    transient do
      course nil
    end

    lesson_plan_item do
      options = {}
      options[:course] = course if course
      build(:course_lesson_plan_item, options)
    end
    tab do
      options = {}
      options[:course] = course if course
      build(:course_assessment_tab, options)
    end
    title { generate(:course_assessment_assessment_name) }
    base_exp 1000
  end
end
