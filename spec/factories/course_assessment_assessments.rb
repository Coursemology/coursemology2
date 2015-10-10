FactoryGirl.define do
  sequence(:course_assessment_assessment_name) { |n| "Assessment #{n}" }
  factory :course_assessment_assessment, class: Course::Assessment, aliases: [:assessment],
                                         parent: :course_lesson_plan_item do
    tab do
      category = course.assessment_categories.first
      category.try(:tabs).try(:first) || build(:course_assessment_tab, course: course)
    end
    title { generate(:course_assessment_assessment_name) }
    base_exp 1000

    trait :with_mcq_question do
      after(:build) do |assessment|
        assessment.questions += [
          build(:course_assessment_question_multiple_response, assessment: assessment)
        ]
      end
    end

    trait :with_all_question_types do
      with_mcq_question
    end
  end
end
