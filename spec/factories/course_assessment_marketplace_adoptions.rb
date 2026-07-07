# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_adoption,
          class: Course::Assessment::Marketplace::Adoption do
    listing { association :course_assessment_marketplace_listing }
    destination_course { association :course }
    duplicated_assessment { association :assessment, course: destination_course }
  end
end
