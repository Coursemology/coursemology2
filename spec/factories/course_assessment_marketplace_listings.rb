# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_listing,
          class: Course::Assessment::Marketplace::Listing do
    transient do
      course { nil }
    end
    assessment { association :assessment, course: course || create(:course) }
    publisher { assessment.course.creator }
    published { true }
    first_published_at { Time.zone.now }
    last_published_at { Time.zone.now }
  end
end
