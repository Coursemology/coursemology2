# frozen_string_literal: true
FactoryBot.define do
  factory :course_gradebook_external_contribution, class: Course::Gradebook::ExternalContribution.name do
    association :external_assessment, factory: :course_external_assessment
    course { external_assessment.course }
    weight { 0 }
  end
end
