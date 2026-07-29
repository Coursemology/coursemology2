# frozen_string_literal: true
json.id @listing.id
# The SNAPSHOT title, matching the index: the marketplace shows what an adopter would actually get.
json.title @listing.current_version&.assessment&.title
json.currentVersionPublishedAt @listing.current_version&.published_at
json.state @listing.admin_state
json.marketplaceHosted @listing.marketplace_hosted?
# Deletion facts, separate from `state`/visibility: a rebuilt listing can be published AND have a
# deleted origin at the same time.
json.sourceAssessmentDeleted @listing.source_assessment_deleted?
json.sourceCourseDeleted @listing.source_course_deleted?
json.authoringAssessmentUrl @authoring_url
json.sourceCourseId @listing.source_course_id
json.sourceCourseName @listing.source_course_name
json.sourceInstanceName @listing.source_instance&.name
json.sourceInstanceHost @listing.source_instance&.host
json.sourceStartedAt @listing.source_started_at
json.sourceEndedAt @listing.source_ended_at

json.versions @versions do |version|
  json.publishedAt version.published_at
  json.publisherName version.published_by&.name
  json.isCurrent version.id == @listing.current_version_id
  json.snapshotUrl @snapshot_urls[System::Admin::MarketplaceListingsController.snapshot_key(version.published_at)]
end

json.adoptions @adoptions do |adoption|
  json.id adoption.id
  json.destinationCourseId adoption.destination_course_id
  json.destinationCourseName adoption.destination_course&.title
  # A course id only resolves on its own instance's host, and adopters span instances.
  json.destinationCourseHost adoption.destination_course&.instance&.host
  json.adoptedVersionAt adoption.adopted_version_at
  json.adoptedAt adoption.created_at
  json.snapshotUrl @snapshot_urls[System::Admin::MarketplaceListingsController.snapshot_key(adoption.adopted_version_at)]
end
