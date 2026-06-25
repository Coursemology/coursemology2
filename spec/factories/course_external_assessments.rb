# frozen_string_literal: true
FactoryBot.define do
  factory :course_external_assessment, class: Course::ExternalAssessment do
    course
    sequence(:title) { |n| "External #{n}" }
    maximum_grade { 100.0 }
  end

  factory :course_external_assessment_grade, class: Course::ExternalAssessmentGrade do
    external_assessment { association(:course_external_assessment) }
    course_user { association(:course_user) }
    grade { 50.0 }
  end
end
