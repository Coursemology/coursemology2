# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_listing,
          class: Course::Assessment::Marketplace::Listing do
    transient do
      course { nil }
    end
    authoring_assessment { association :assessment, course: course || create(:course) }
    publisher { authoring_assessment.course.creator }
    published { true }
    first_published_at { Time.zone.now }
    last_published_at { Time.zone.now }

    # Mirrors the post-Slice-2 shape: a listing whose served content is a snapshot distinct from
    # the authoring copy. The stand-in snapshot is created in the origin's own course rather than
    # the shared preview container — deliberately, so unrelated specs neither pay for container
    # (and preview-instance) creation nor grow it. The real container path is covered by
    # `publish_service_spec.rb`.
    trait :versioned do
      after(:create) do |listing, _evaluator|
        version = create(:course_assessment_marketplace_listing_version,
                         listing: listing,
                         assessment: create(:assessment, course: listing.authoring_assessment.course),
                         published_at: listing.first_published_at || Time.zone.now,
                         published_by: listing.publisher)
        listing.update!(current_version: version)
      end
    end
  end
end
