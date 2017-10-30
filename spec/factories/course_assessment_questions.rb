# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question, class: Course::Assessment::Question do
    sequence(:title) { |n| "The awesome question #{n}" }
    description 'Look at this awesome question'
    staff_only_comments 'Deep pedagogical insight.'
    maximum_grade 2

    transient do
      assessment nil
    end

    after(:build) do |question, evaluator|
      question.question_assessments.build(assessment: evaluator.assessment, weight: 1) if evaluator.assessment
    end
  end
end
