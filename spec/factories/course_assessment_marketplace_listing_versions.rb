# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_listing_version,
          class: Course::Assessment::Marketplace::ListingVersion do
    listing { association :course_assessment_marketplace_listing }
    assessment
    published_by { listing.publisher }
    # Distinct per row: `published_at` is unique per listing, and a factory that stamped the same
    # instant twice would collide the moment a spec cut two versions of one listing.
    sequence(:published_at) { |n| n.minutes.ago }
  end
end
