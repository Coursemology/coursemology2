# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_listing_version,
          class: Course::Assessment::Marketplace::ListingVersion do
    listing { association :course_assessment_marketplace_listing }
    assessment
    published_by { listing.publisher }
    sequence(:version) { |n| n }
  end
end
